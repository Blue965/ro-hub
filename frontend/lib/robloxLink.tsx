import supabase from '../lib/supabaseClient'

export async function createRobloxProof() {
  const session = await supabase.auth.getSession()
  const accessToken = session.data.session?.access_token
  if (!accessToken) throw new Error('Not authenticated')
  const res = await fetch('/api/roblox/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
    body: JSON.stringify({ action: 'create' })
  })
  return res.json()
}

export async function verifyRobloxProof(username:string) {
  const session = await supabase.auth.getSession()
  const accessToken = session.data.session?.access_token
  if (!accessToken) throw new Error('Not authenticated')
  const res = await fetch('/api/roblox/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
    body: JSON.stringify({ action: 'verify', username })
  })
  return res.json()
}
