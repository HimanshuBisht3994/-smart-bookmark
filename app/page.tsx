'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      console.error('OAuth error:', error)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="px-6 py-3 bg-black text-white rounded disabled:opacity-50"
      >
        {loading ? 'Redirecting...' : 'Sign in with Google'}
      </button>
    </main>
  )
}