'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SimpleAuthForm } from '@/components/app/Auth/SimpleAuthForm'
import { Dashboard } from '@/components/app/Dashboard/Dashboard'
import { supabase } from '@/lib/supabase'

export default function AppPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Load user profile
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then((response: any) => {
          setProfile(response.data)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show dashboard if user is logged in and has profile
  if (user && profile) {
    return <Dashboard profile={profile} />
  }

  // Show auth form if not logged in
  return <SimpleAuthForm />
}