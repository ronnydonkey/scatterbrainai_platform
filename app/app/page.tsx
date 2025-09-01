'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SimpleAuthForm } from '@/components/app/Auth/SimpleAuthForm'

export default function AppPage() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <SimpleAuthForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Welcome to ScatterBrainAI</h1>
        <p className="text-gray-600">Logged in as: {user.email}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Dashboard will be loaded here</p>
        </div>
      </div>
    </div>
  )
}