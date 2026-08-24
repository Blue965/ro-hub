import { useState } from 'react'
import supabase from '../lib/supabaseClient'
import { v4 as uuidv4 } from 'uuid'

export default function ProjectForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [readme, setReadme] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e:any) {
    e.preventDefault()
    setLoading(true)
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      const { data: project } = await supabase.from('projects').insert({ name, slug, description, readme, owner_id: user?.id }).select().single()

      if (file && project) {
        // Create version via server (ensures ownership)
        const session = await supabase.auth.getSession()
        const accessToken = session.data.session?.access_token
        const vRes = await fetch('/api/projects/version', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
          body: JSON.stringify({ project_id: project.id })
        })
        const vJson = await vRes.json()
        if (!vRes.ok) throw new Error(vJson.error || 'Version creation failed')
        const version = vJson.version

        const versionId = version.id
        const path = `${project.id}/${versionId}/${file.name}`
        // upload to storage using anon client
        const { error: uploadError } = await supabase.storage.from('projects').upload(path, file)
        if (uploadError) throw uploadError

        // register file via server
        const regRes = await fetch('/api/projects/register-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
          body: JSON.stringify({ version_id: versionId, filename: file.name, storage_path: path, content_type: file.type, size: file.size })
        })
        const regJson = await regRes.json()
        if (!regRes.ok) throw new Error(regJson.error || 'File register failed')
      }

      alert('Project created')
    } catch (err:any) {
      console.error(err)
      alert('Error: ' + err.message)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full border rounded p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">README (markdown)</label>
        <textarea value={readme} onChange={e=>setReadme(e.target.value)} className="mt-1 w-full border rounded p-2 h-32" />
      </div>
      <div>
        <label className="block text-sm font-medium">Upload a file (.lua, .txt)</label>
        <input type="file" accept=".lua,.txt" onChange={e=>setFile(e.target.files?.[0]||null)} />
      </div>
      <div>
        <button disabled={loading} className="bg-roblue-500 text-white px-4 py-2 rounded">Create</button>
      </div>
    </form>
  )
}
