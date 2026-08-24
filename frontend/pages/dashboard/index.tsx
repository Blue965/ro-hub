import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { createRobloxProof, verifyRobloxProof } from '../../lib/robloxLink'
import supabase from '../../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [code, setCode] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(res => setUser(res.data.user))
  }, [])

  async function handleCreateProof() {
    try {
      setStatus('Generating code...')
      const res = await createRobloxProof()
      setCode(res.code)
      setStatus('Code generated — paste it in your Roblox profile description then click Verify')
    } catch (err:any) {
      setStatus('Error: ' + err.message)
    }
  }

  async function handleVerify() {
    try {
      setStatus('Verifying...')
      const res = await verifyRobloxProof(username)
      if (res.ok) setStatus('Verified! Your Roblox account is linked.')
      else setStatus('Not verified: ' + (res.error || 'unknown'))
    } catch (err:any) {
      setStatus('Error: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-roblue-50">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="bg-white p-4 rounded shadow space-y-4">
          <div>
            <strong>User:</strong> {user?.email || 'Not signed in'}
          </div>

          <div>
            <h2 className="font-semibold">Roblox account linking</h2>
            <p className="text-sm text-gray-600">Generate a short code, paste it in your Roblox profile description (Bio), then verify.</p>
            <div className="mt-3">
              <button onClick={handleCreateProof} className="bg-roblue-500 text-white px-3 py-1 rounded mr-2">Generate code</button>
              {code && <span className="ml-2 px-2 py-1 bg-gray-100 rounded">Code: <strong>{code}</strong></span>}
            </div>
            <div className="mt-3">
              <input placeholder="Roblox username" value={username} onChange={e=>setUsername(e.target.value)} className="border p-2 rounded mr-2" />
              <button onClick={handleVerify} className="bg-roblue-700 text-white px-3 py-1 rounded">Verify</button>
            </div>
            <div className="mt-2 text-sm text-gray-600">{status}</div>
          </div>
        </div>

      </main>
    </div>
  )
}
