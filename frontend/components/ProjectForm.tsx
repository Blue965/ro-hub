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
      const user = (await supabase.auth.getUser()).data.user
      const { data: project } = await supabase.from('projects').insert({ name, slug, description, readme, owner_id: user?.id }).select().single()

      if (file && project) {
        const versionRes = await supabase.from('versions').insert({ project_id: project.id, created_by: user?.id, version_tag: 'v1' }).select().single()
        const versionId = versionRes.data?.id || versionRes.id || uuidv4()
        const path = `${project.id}/${versionId}/${file.name}`
        const { error: uploadError } = await supabase.storage.from('projects').upload(path, file)
        if (uploadError) throw uploadError
        await supabase.from('files').insert({ version_id: versionId, filename: file.name, storage_path: path, content_type: file.type, size: file.size })
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
