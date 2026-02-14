'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <div className="space-x-6">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/profile">Profile</Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm">
          {user.user_metadata?.full_name}
        </span>

        <button onClick={logout} className="text-red-500 text-sm">
          Logout
        </button>
      </div>
    </nav>
  )
}