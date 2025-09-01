'use client'

import { useEffect, useState } from 'react'
import { SimpleAuthForm } from '@/components/app/Auth/SimpleAuthForm'
import { SimpleCreateBrainForm } from '@/components/app/Auth/SimpleCreateBrainForm'

export default function AppPage() {
  const [showCreateBrain, setShowCreateBrain] = useState(false)

  useEffect(() => {
    // Check URL params on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('create') === 'true') {
        setShowCreateBrain(true)
      }
    }
  }, [])

  if (showCreateBrain) {
    return <SimpleCreateBrainForm onSuccess={() => window.location.reload()} />
  }

  return <SimpleAuthForm />
}