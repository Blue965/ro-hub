import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-roblue-500 rounded" />
          <span className="font-bold">Ro Hub</span>
        </Link>
        <nav>
          <Link href="/" className="mr-4">Explore</Link>
          <Link href="/dashboard/new-project" className="bg-roblue-500 text-white px-3 py-1 rounded">New</Link>
        </nav>
      </div>
    </header>
  )
}
