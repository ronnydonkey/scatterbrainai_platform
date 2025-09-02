'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAuthPage() {
  const { user, loading } = useAuth()
  const [session, setSession] = useState<any>(null)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify({
          loading,
          user: user ? { id: user.id, email: user.email } : null,
          session: session ? { 
            user: { id: session.user.id, email: session.user.email },
            expires_at: session.expires_at 
          } : null,
          timestamp: new Date().toISOString()
        }, null, 2)}
      </pre>
      <div className="mt-4 space-x-4">
        <a href="/app" className="text-blue-600 underline">Go to /app</a>
        <a href="/app/dashboard" className="text-blue-600 underline">Go to /app/dashboard</a>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Reload
        </button>
      </div>
    </div>
  )
}