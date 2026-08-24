import type { NextApiRequest, NextApiResponse } from 'next'
import supabaseAdmin from '../../../lib/supabaseServer'

// GET /api/files/download?path={storage_path}
// Requires Authorization

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' })
  const token = auth.split(' ')[1]
  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userRes?.user) return res.status(401).json({ error: 'Invalid token' })

  const storage_path = String(req.query.path || '')
  if (!storage_path) return res.status(400).json({ error: 'Missing path' })

  try {
    const bucket = 'projects'
    // expires in 1 minute
    const { data } = await supabaseAdmin.storage.from(bucket).createSignedUrl(storage_path, 60)
    if (!data?.signedUrl) return res.status(500).json({ error: 'Unable to create signed url' })
    return res.json({ url: data.signedUrl })
  } catch (err:any) {
    return res.status(500).json({ error: err.message })
  }
}
