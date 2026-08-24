import { useState } from 'react'
import { auth, db, storage } from '../lib/firebaseClient'
import { v4 as uuidv4 } from 'uuid'
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

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
      const user = auth.currentUser
      if (!user) throw new Error('Not authenticated')

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      // create project doc in Firestore
      const projectRef = await addDoc(collection(db, 'projects'), {
        name,
        slug,
        description,
        readme,
        ownerId: user.uid,
        created_at: serverTimestamp(),
        visibility: 'public'
      })

      if (file) {
        // create a version doc
        const versionRef = await addDoc(collection(db, `projects/${projectRef.id}/versions`), {
          created_by: user.uid,
          notes: null,
          created_at: serverTimestamp(),
        })

        const path = `${projectRef.id}/${versionRef.id}/${file.name}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, file)
        const downloadUrl = await getDownloadURL(storageRef)

        // register file metadata under versions/{versionId}/files
        const fileId = uuidv4()
        await setDoc(doc(db, `projects/${projectRef.id}/versions/${versionRef.id}/files`, fileId), {
          filename: file.name,
          storage_path: path,
          content_type: file.type,
          size: file.size,
          download_url: downloadUrl,
          created_at: serverTimestamp()
        })
      }

      alert('Project created')
    } catch (err:any) {
      console.error(err)
      alert('Error: ' + (err.message || String(err)))
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
