import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import CodeViewer from '../../components/CodeViewer'
import supabase from '../../lib/supabaseClient'

export default function ProjectPage() {
  const router = useRouter()
  const { slug } = router.query
  const [project, setProject] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [previewCode, setPreviewCode] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      const { data } = await supabase.from('projects').select('*').eq('slug', slug).single()
      setProject(data)
      if (data) {
        const { data: vdata } = await supabase.from('versions').select('*, files(*)').eq('project_id', data.id).order('created_at', { ascending: false })
        setVersions(vdata || [])
        // load first file preview if exists
        if (vdata && vdata.length > 0 && vdata[0].files && vdata[0].files.length > 0) {
          const f = vdata[0].files[0]
          const download = await fetch(`/api/files/download?path=${encodeURIComponent(f.storage_path)}`, { headers: { Authorization: 'Bearer ' + (await (await supabase.auth.getSession()).data.session?.access_token) } })
          const j = await download.json()
          const raw = await fetch(j.url).then(r=>r.text())
          setPreviewCode(raw)
        }
      }
    })()
  }, [slug])

  async function handleDownload(path:string) {
    const session = await supabase.auth.getSession()
    const accessToken = session.data.session?.access_token
    const res = await fetch(`/api/files/download?path=${encodeURIComponent(path)}`, { headers: { Authorization: 'Bearer ' + accessToken } })
    const j = await res.json()
    if (j.url) window.open(j.url, '_blank')
  }

  if (!project) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-sm text-gray-600 mb-4">By {project.owner_id} • {project.license || 'No license'}</p>
        <div className="prose mb-6">
          <pre className="whitespace-pre-wrap">{project.readme || project.description}</pre>
        </div>

        <h2 className="text-xl font-semibold mb-3">Versions</h2>
        <div className="space-y-4">
          {versions.map(v => (
            <div key={v.id} className="p-3 bg-roblue-50 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <strong>{v.version_tag || 'v' + new Date(v.created_at).toISOString()}</strong>
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
