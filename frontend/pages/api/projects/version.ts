import type { NextApiRequest, NextApiResponse } from 'next'
import supabaseAdmin from '../../../lib/supabaseServer'

// POST /api/projects/version
// body: { project_id }
// Requires Authorization: Bearer <access_token>

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' })
  const token = auth.split(' ')[1]
  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userRes?.user) return res.status(401).json({ error: 'Invalid token' })
  const user = userRes.user

  const { project_id } = req.body
  if (!project_id) return res.status(400).json({ error: 'Missing project_id' })

  // ensure the user is owner of the project
  const { data: proj, error: projErr } = await supabaseAdmin.from('projects').select('id, owner_id').eq('id', project_id).single()
  if (projErr || !proj) return res.status(404).json({ error: 'Project not found' })
  if (proj.owner_id !== user.id) return res.status(403).json({ error: 'Not the owner' })

  const { data, error } = await supabaseAdmin.from('versions').insert({ project_id, created_by: user.id }).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ version: data })
}
