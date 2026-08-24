import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import CodeViewer from '../../components/CodeViewer'
import supabase from '../../lib/supabaseClient'

export default function ProjectPage() {
  const router = useRouter()
  const { slug } = router.query
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    if (!slug) return
    ;(async () => {
      const { data } = await supabase.from('projects').select('*').eq('slug', slug).single()
      setProject(data)
    })()
  }, [slug])

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

        <h2 className="text-xl font-semibold mb-3">Latest files</h2>
        <div className="space-y-3">
          {/* TODO: list versions + files */}
          <CodeViewer code={`-- exemple.lua\nprint('Hello Ro Hub')`} language="lua" />
        </div>
      </main>
    </div>
  )
}
