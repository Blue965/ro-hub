import { useState } from 'react'
import supabase from '../../lib/supabaseClient'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail(e:any) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert('Error: ' + error.message)
    else alert('Check your email for the magic link')
    setLoading(false)
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-roblue-50">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Sign in to Ro Hub</h2>
        <button onClick={signInWithGoogle} className="w-full bg-roblue-500 text-white py-2 rounded mb-3">Sign in with Google</button>

        <form onSubmit={signInWithEmail} className="space-y-3">
          <div>
            <label className="block text-sm">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded p-2" required />
          </div>
          <div>
            <button disabled={loading} className="w-full bg-roblue-700 text-white py-2 rounded">Send magic link</button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Need to link your Roblox account? Go to your Dashboard after signing in to generate a proof code.
        </div>
      </div>
    </div>
  )
}
