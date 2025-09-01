'use client'

import { useState, useEffect } from 'react'

export default function AppPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">ScatterBrainAI App</h1>
        <p className="text-gray-600">The app is loading... If you see this, the basic page works!</p>
        <div className="mt-4">
          <a href="/app/debug" className="text-blue-600 hover:underline">Check Debug Info</a>
        </div>
      </div>
    </div>
  )
}