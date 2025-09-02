'use client'

import { Dashboard } from '@/components/app/Dashboard/Dashboard'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const { user } = useAuth()
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
        .then(({ data }) => {
          setProfile(data)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Please log in first</div>
  }

  return <Dashboard profile={profile} />
}