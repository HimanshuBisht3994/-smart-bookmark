'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.replace('/')
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Name:</strong> {user.user_metadata?.full_name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  )
}