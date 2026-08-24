import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import ProjectCard from '../../components/ProjectCard'

export default function Home() {
  return (
    <div className="min-h-screen bg-roblue-50">
      <Head>
        <title>Ro Hub</title>
      </Head>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Découvrir</h1>
          <Link href="/dashboard/new-project" className="bg-roblue-500 text-white px-4 py-2 rounded">New Project</Link>
        </div>
        <div className="grid gap-4">
          <ProjectCard title="Example Project" description="Un script Roblox génial" stars={12} owner="alice" />
          <ProjectCard title="PhysicsLib" description="Library for physics" stars={6} owner="bob" />
        </div>
      </main>
    </div>
  )
}
