'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
}

export default function Dashboard() {
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setLoading(false)
        router.replace('/')
        return
      }

      const uid = data.session.user.id
      setUserId(uid)

      const { data: initial } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (initial) setBookmarks(initial)

      setLoading(false)

      channel = supabase
        .channel('bookmarks')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookmarks',
            filter: `user_id=eq.${uid}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setBookmarks((prev) => [
                payload.new as Bookmark,
                ...prev,
              ])
            }

            if (payload.eventType === 'DELETE') {
              setBookmarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id)
              )
            }
          }
        )
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [router])

  const addBookmark = async () => {
    if (!title || !url || !userId) return

    await supabase.from('bookmarks').insert({
      title,
      url,
      user_id: userId,
    })

    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 flex-1"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border p-2 flex-1"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={addBookmark}
          className="bg-black text-white px-4"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {bookmarks.map((b) => (
          <li key={b.id} className="flex justify-between border p-2">
            <a href={b.url} target="_blank" className="underline">
              {b.title}
            </a>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}