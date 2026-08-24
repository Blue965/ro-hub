import type { NextApiRequest, NextApiResponse } from 'next'
import supabaseAdmin from '../../../lib/supabaseServer'

// POST /api/projects/register-file
// body: { version_id, filename, storage_path, content_type, size }
// Requires Authorization

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' })
  const token = auth.split(' ')[1]
  const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(token)
  if (userErr || !userRes?.user) return res.status(401).json({ error: 'Invalid token' })
  const user = userRes.user

  const { version_id, filename, storage_path, content_type, size } = req.body
  if (!version_id || !filename || !storage_path) return res.status(400).json({ error: 'Missing fields' })

  // verify version exists and belongs to a project owned by user
  const { data: v, error: vErr } = await supabaseAdmin.from('versions').select('id, project_id').eq('id', version_id).single()
  if (vErr || !v) return res.status(404).json({ error: 'Version not found' })
  const { data: proj, error: projErr } = await supabaseAdmin.from('projects').select('id, owner_id').eq('id', v.project_id).single()
  if (projErr || !proj) return res.status(404).json({ error: 'Project not found' })
  if (proj.owner_id !== user.id) return res.status(403).json({ error: 'Not the owner' })

  const { data, error } = await supabaseAdmin.from('files').insert({ version_id, filename, storage_path, content_type, size }).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.json({ file: data })
}
