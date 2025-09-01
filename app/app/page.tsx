'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { SimpleAuthForm } from '@/components/app/Auth/SimpleAuthForm'
import { SimpleCreateBrainForm } from '@/components/app/Auth/SimpleCreateBrainForm'
import { OnboardingFlow } from '@/components/app/Onboarding/OnboardingFlow'
import { Dashboard } from '@/components/app/Dashboard/Dashboard'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

function AppContent() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<{
    id: string
    brain_name: string
    onboarding_completed: boolean
    trial_end_date: string
    subscription_status: string
  } | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)
  const [showCreateBrain, setShowCreateBrain] = useState(false)
  const searchParams = useSearchParams()
  
  // Check if user came from landing page CTA
  useEffect(() => {
    if (searchParams?.get('create') === 'true') {
      setShowCreateBrain(true)
    }
  }, [searchParams])

  const checkUserProfile = useCallback(async () => {
    if (!user?.id) {
      setCheckingProfile(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error checking profile:', error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
      setProfile(null)
    } finally {
      setCheckingProfile(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      checkUserProfile()
    } else {
      setCheckingProfile(false)
    }
  }, [user, checkUserProfile])

  const handleOnboardingComplete = async () => {
    if (!user?.id) return
    
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)
    
    checkUserProfile()
  }

  const handleCreateBrainSuccess = () => {
    checkUserProfile()
  }

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    if (showCreateBrain) {
      return <SimpleCreateBrainForm onSuccess={() => window.location.reload()} />
    }
    return <SimpleAuthForm />
  }

  if (!profile) {
    return <SimpleCreateBrainForm onSuccess={handleCreateBrainSuccess} />
  }

  if (!profile.onboarding_completed) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return <Dashboard profile={profile} />
}

export default function AppPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AppContent />
    </Suspense>
  )
}