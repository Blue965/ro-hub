import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import CodeViewer from '../../components/CodeViewer'
import { db, storage } from '../../lib/firebaseClient'
import { collection, query, where, getDocs, getDoc, doc, orderBy } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'

export default function ProjectPage() {
  const router = useRouter()
  const { slug } = router.query
  const [project, setProject] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [previewCode, setPreviewCode] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      // find project by slug
      const q = query(collection(db, 'projects'), where('slug', '==', String(slug)))
      const snap = await getDocs(q)
      if (snap.empty) return
      const pdoc = snap.docs[0]
      const pdata = { id: pdoc.id, ...pdoc.data() }
      setProject(pdata)

      // load versions
      const vSnap = await getDocs(collection(db, `projects/${pdoc.id}/versions`))
      const vdata = await Promise.all(vSnap.docs.map(async vd => {
        const v = { id: vd.id, ...vd.data() }
        // load files subcollection
        const fSnap = await getDocs(collection(db, `projects/${pdoc.id}/versions/${vd.id}/files`))
        v.files = fSnap.docs.map(fd => ({ id: fd.id, ...fd.data() }))
        return v
      }))
      setVersions(vdata)

      // preview first file if exists
      if (vdata && vdata.length > 0 && vdata[0].files && vdata[0].files.length > 0) {
        const f = vdata[0].files[0]
        try {
          const downloadUrl = f.download_url || (await getDownloadURL(ref(storage, f.storage_path)))
          const raw = await fetch(downloadUrl).then(r=>r.text())
          setPreviewCode(raw)
        } catch (err) {
          console.warn('Preview failed', err)
        }
      }
    })()
  }, [slug])

  async function handleDownload(path:string) {
    try {
      const url = await getDownloadURL(ref(storage, path))
      window.open(url, '_blank')
    } catch (err:any) {
      alert('Download error: ' + (err.message || String(err)))
    }
  }

  if (!project) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-sm text-gray-600 mb-4">By {project.ownerId} • {project.license || 'No license'}</p>
        <div className="prose mb-6">
          <pre className="whitespace-pre-wrap">{project.readme || project.description}</pre>
        </div>

        <h2 className="text-xl font-semibold mb-3">Versions</h2>
        <div className="space-y-4">
          {versions.map(v => (
            <div key={v.id} className="p-3 bg-roblue-50 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{v.version_tag || 'v' + new Date(v.created_at?.toDate ? v.created_at.toDate() : v.created_at).toISOString()}</strong>
                  <div className="text-sm text-gray-600">{v.notes}</div>
                </div>
                <div className="flex items-center gap-2">
                  {v.files && v.files.map((f:any) => (
                    <button key={f.id} onClick={() => handleDownload(f.storage_path)} className="px-3 py-1 bg-roblue-500 text-white rounded">Download {f.filename}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-6 mb-3">Preview</h2>
        {previewCode ? <CodeViewer code={previewCode} language="lua" /> : <div className="text-sm text-gray-600">No preview available</div>}

      </main>
    </div>
  )
}
