'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SimpleAuthForm } from '@/components/app/Auth/SimpleAuthForm'
import { Dashboard } from '@/components/app/Dashboard/Dashboard'

export default function AppPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show dashboard if user is logged in
  if (user) {
    return <Dashboard />
  }

  // Show auth form if not logged in
  return <SimpleAuthForm />
}