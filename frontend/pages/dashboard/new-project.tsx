import Header from '../../components/Header'
import ProjectForm from '../../components/ProjectForm'

export default function NewProject() {
  return (
    <div className="min-h-screen bg-roblue-50">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Create a new project</h1>
        <ProjectForm />
      </main>
    </div>
  )
}
