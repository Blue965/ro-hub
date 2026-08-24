import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import { v4 as uuidv4 } from 'uuid'
import { auth as firebaseAuth, db } from '../../lib/firebaseClient'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [code, setCode] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      if (u) setUser({ email: u.email, id: u.uid })
      else setUser(null)
    })
    return () => unsub()
  }, [])

  async function handleCreateProof() {
    try {
      if (!user) return setStatus('Please sign in first')
      setStatus('Generating code...')
      const code = uuidv4().slice(0, 8)
      // store in Firestore
      await addDoc(collection(db, 'roblox_links'), {
        userId: user.id,
        code,
        username: null,
        verified: false,
        created_at: serverTimestamp()
      })
      setCode(code)
      setStatus('Code generated — paste it in your Roblox profile description then click Verify')
    } catch (err:any) {
      setStatus('Error: ' + (err.message || String(err)))
    }
  }

  async function handleVerify() {
    try {
      setStatus('Verifying...')
      // For now verification requires server-side check against Roblox profile.
      // We fallback to checking if an admin/worker set verified=true in the roblox_links doc.
      // Inform user accordingly.
      if (!user) return setStatus('Please sign in first')
      const q = collection(db, 'roblox_links')
      // naive check: find doc for user and username
      const snap = await (await import('firebase/firestore')).getDocs((0, (await import('firebase/firestore')).query)(q, (await import('firebase/firestore')).where('userId', '==', user.id), (await import('firebase/firestore')).where('username', '==', username)))
      let found = false
      snap.forEach(s => {
        const data = s.data()
        if (data.verified) found = true
      })
      if (found) setStatus('Verified! Your Roblox account is linked.')
      else setStatus('Not verified yet. Verification requires us to check your Roblox profile — this step will be available once server-side verifier is enabled.')
    } catch (err:any) {
      setStatus('Error: ' + (err.message || String(err)))
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
