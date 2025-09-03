'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Brain, LogOut, Plus, Search, Filter, Download, Settings, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { SimpleInputArea } from './SimpleInputArea'
import { SimpleThoughtCard } from './SimpleThoughtCard'
import { CleanAnalysisReport } from './CleanAnalysisReport'
import { AnalysisProgress } from './AnalysisProgress'
import { TrialCountdown } from '../TrialCountdown'
import { SimpleVoiceDiscoveryWizard } from '@/components/voice/SimpleVoiceDiscoveryWizard'
import { VoiceProfileDisplay } from '@/components/voice/VoiceProfileDisplay'
import { VoiceDiscoveryResponse, VoiceProfile } from '@/lib/onboarding/voice-discovery'
import ErrorBoundary from '@/components/ErrorBoundary'

interface Thought {
  id: string
  title: string
  content: string
  source_type: 'text' | 'url'
  source_data: string
  analysis: any
  generated_content: string | null
  tags: string[]
  created_at: string
  voice_archetype?: string
  authenticity_score?: number
}

interface DashboardProps {
  profile: {
    id: string
    brain_name: string
    onboarding_completed: boolean
    trial_end_date: string
    subscription_status: string
  }
}

export function SimpleDashboard({ profile }: DashboardProps) {
  const { user, signOut } = useAuth()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null)
  const [showVoiceDiscovery, setShowVoiceDiscovery] = useState(false)
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null)
  const [checkingVoiceProfile, setCheckingVoiceProfile] = useState(true)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const checkVoiceProfile = useCallback(async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setVoiceProfile(data as VoiceProfile)
        setShowVoiceDiscovery(false)
      } else {
        // Check if they've dismissed voice discovery before
        const dismissed = localStorage.getItem('voice_discovery_dismissed')
        if (!dismissed) {
          setShowVoiceDiscovery(true)
        }
      }
    } catch {
      console.log('No voice profile found')
    } finally {
      setCheckingVoiceProfile(false)
    }
  }, [user])

  // Check for voice profile on mount
  useEffect(() => {
    if (user) {
      checkVoiceProfile()
    }
  }, [user, checkVoiceProfile])

  const handleVoiceDiscoveryComplete = async (responses: VoiceDiscoveryResponse[]) => {
    try {
      const response = await fetch('/api/voice-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      })
      
      const data = await response.json()
      
      if (data.profile) {
        setVoiceProfile(data.profile)
        setShowVoiceDiscovery(false)
      }
    } catch (error) {
      console.error('Error completing voice discovery:', error)
    }
  }

  const handleVoiceDiscoverySkip = () => {
    setShowVoiceDiscovery(false)
    localStorage.setItem('voice_discovery_dismissed', 'true')
  }

  const loadThoughts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setThoughts(data || [])
    } catch (error) {
      console.error('Error loading thoughts:', error)
    }
  }, [user?.id])

  useEffect(() => {
    if (user && !checkingVoiceProfile) {
      loadThoughts()
    }
  }, [user, loadThoughts, checkingVoiceProfile])

  const handleAnalyze = async (content: string, _type: 'text' | 'url') => {
    if (!user) return
    
    setLoading(true)
    setAnalysisError(null)
    try {
      // Get the session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No session found')
        setAnalysisError('Authentication error: Please sign in again.')
        setLoading(false)
        return
      }

      // Use voice-aware analysis if voice profile exists
      const endpoint = voiceProfile ? '/api/voice-analyze-content' : '/api/analyze-content'
      
      console.log('Calling API endpoint:', endpoint)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content, brainId: profile.id })
      })

      console.log('API response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData)
        setAnalysisError(errorData.error || 'Failed to analyze content. Please try again.')
        setLoading(false)
        return
      }

      const result = await response.json()
      console.log('API result:', result)
      
      if (result.success) {
        await loadThoughts()
        
        // Get the newly created thought
        const { data: newThought, error: thoughtError } = await supabase
          .from('thoughts')
          .select('*')
          .eq('id', result.thoughtId)
          .single()
        
        if (thoughtError) {
          console.error('Error fetching new thought:', thoughtError)
          setAnalysisError('Could not load the analysis results. Please try again.')
          return
        }
        
        if (newThought) {
          setSelectedThought(newThought)
          setShowReport(true)
        }
        
        // Check if user needs voice onboarding
        if (result.analysis && result.analysis.needsVoiceOnboarding) {
          setShowVoiceDiscovery(true)
        }
      } else {
        setAnalysisError('Analysis failed. Please try again with shorter content.')
      }
    } catch (error) {
      console.error('Error analyzing content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze content'
      setAnalysisError(`An error occurred. Try clicking analyze again OR shorten your content. ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredThoughts = thoughts.filter(thought =>
    thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (thought.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (checkingVoiceProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show voice discovery wizard if needed
  if (showVoiceDiscovery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl">
          <SimpleVoiceDiscoveryWizard 
            onComplete={handleVoiceDiscoveryComplete}
            onSkip={handleVoiceDiscoverySkip}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {profile.subscription_status === 'trial' && profile.trial_end_date && (
        <TrialCountdown 
          trialEndDate={profile.trial_end_date} 
          onUpgrade={() => window.location.href = '/app/upgrade'}
        />
      )}
      
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{profile.brain_name || 'My Brain'}</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {voiceProfile && (
                <button
                  onClick={() => setShowVoiceDiscovery(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Voice Profile</span>
                </button>
              )}
              
              <button
                onClick={() => window.location.href = '/app/export'}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/app/settings'}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Voice Profile Display */}
          {voiceProfile && (
            <div className="max-w-2xl mx-auto">
              <VoiceProfileDisplay profile={voiceProfile} compact />
            </div>
          )}

          {/* Input Area */}
          <div className="max-w-2xl mx-auto">
            <SimpleInputArea onSubmit={handleAnalyze} loading={loading} />
          </div>

          {/* Thought Library */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Your Thought Library</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span>{filteredThoughts.length} thoughts</span>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search your thoughts..."
                      className="border-0 focus:ring-0 text-gray-900 placeholder-gray-500 w-64 outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredThoughts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchQuery ? 'No matching thoughts' : 'Start Your Journey'}
                </h3>
                <p className="text-gray-600 text-lg">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Add your first thought or URL to begin building your external brain'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredThoughts.map((thought) => (
                  <SimpleThoughtCard 
                    key={thought.id}
                    thought={thought} 
                    onViewReport={() => {
                      setSelectedThought(thought)
                      setShowReport(true)
                    }}
                    onDelete={(id) => {
                      setThoughts(thoughts.filter(t => t.id !== id))
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Total Thoughts</h3>
              <div className="text-3xl font-bold text-blue-600">{thoughts.length}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">This Month</h3>
              <div className="text-3xl font-bold text-purple-600">
                {thoughts.filter(t => 
                  new Date(t.created_at).getMonth() === new Date().getMonth()
                ).length}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Voice-Enhanced</h3>
              <div className="text-3xl font-bold text-green-600">
                {thoughts.filter(t => t.voice_archetype).length}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AnalysisProgress 
        isOpen={loading || !!analysisError} 
        error={analysisError}
        onRetry={() => {
          setAnalysisError(null);
          // You might want to retry the last analysis here
        }}
      />
      
      {showReport && selectedThought && (
        <ErrorBoundary>
          <CleanAnalysisReport 
            thought={selectedThought} 
            onClose={() => {
              setShowReport(false)
              setSelectedThought(null)
            }}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}