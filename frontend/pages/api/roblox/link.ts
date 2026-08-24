import type { NextApiRequest, NextApiResponse } from 'next'
import supabaseAdmin from '../../lib/supabaseServer'
import { randomBytes } from 'crypto'

// POST /api/roblox/link
// Body: { action: 'create' } -> returns { code }
// Body: { action: 'verify', username: 'robloxUsername' } -> checks profile description contains code

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' })
  const token = auth.split(' ')[1]

  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userRes?.user) return res.status(401).json({ error: 'Invalid token' })
  const user = userRes.user

  const { action } = req.body

  if (action === 'create') {
    // generate short proof code
    const code = randomBytes(3).toString('hex') // 6 hex chars
    const { error } = await supabaseAdmin.from('roblox_links').insert({ user_id: user.id, code })
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ code })
  }

  if (action === 'verify') {
    const { username } = req.body
    if (!username) return res.status(400).json({ error: 'Missing username' })

    // fetch latest link record for user
    const { data: linkRows, error: linkErr } = await supabaseAdmin.from('roblox_links').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
    if (linkErr) return res.status(500).json({ error: linkErr.message })
    const link = linkRows?.[0]
    if (!link) return res.status(404).json({ error: 'No proof code found. Generate one first.' })

    // resolve roblox user id by username
    try {
      const uRes = await fetch(`https://users.roblox.com/v1/users/by-username/${encodeURIComponent(username)}`)
      if (!uRes.ok) return res.status(400).json({ error: 'Roblox username not found' })
      const uJson = await uRes.json()
      const robloxId = uJson.id
      const pRes = await fetch(`https://users.roblox.com/v1/users/${robloxId}/profile`)
      if (!pRes.ok) return res.status(400).json({ error: 'Unable to fetch profile' })
      const pJson = await pRes.json()
      const description = String(pJson.description || '')
      const found = description.includes(link.code)
      if (found) {
        await supabaseAdmin.from('roblox_links').update({ verified: true, username, verified_at: new Date().toISOString() }).eq('id', link.id)
        return res.json({ ok: true })
      } else {
        return res.status(400).json({ ok: false, error: 'Proof code not found in profile description' })
      }
    } catch (err:any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(400).json({ error: 'Unknown action' })
}
