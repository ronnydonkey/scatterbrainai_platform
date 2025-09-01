'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, LogOut, Plus, Search, Filter, Download } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { analyzeContent } from '@/services/claudeService'
import { extractUrlContent } from '@/services/urlService'
import { InputArea } from './InputArea'
import { ThoughtCard } from './ThoughtCard'
import { LoadingAnimation } from './LoadingAnimation'
import { AnalysisReport } from './AnalysisReport'
import { TrialCountdown } from '../TrialCountdown'

interface Thought {
  id: string
  title: string
  content: string
  source_type: 'text' | 'url'
  source_data: string
  analysis: string | null
  generated_content: string | null
  tags: string[]
  created_at: string
}

interface DashboardProps {
  profile: any
}

export function Dashboard({ profile }: DashboardProps) {
  const { user, signOut } = useAuth()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showReport, setShowReport] = useState(false)
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null)

  useEffect(() => {
    if (user) {
      loadThoughts()
    }
  }, [user])

  const loadThoughts = async () => {
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
  }

  const handleAnalyze = async (content: string, type: 'text' | 'url') => {
    if (!user) return
    
    setLoading(true)
    try {
      let analysisContent = content
      
      if (type === 'url') {
        analysisContent = await extractUrlContent(content)
      }

      const analysis = await analyzeContent(analysisContent, type)
      
      // Get user's writing style for personalized content
      await supabase
        .from('profiles')
        .select('writing_style')
        .eq('id', user.id)
        .single()

      // Generate title from first few words
      const title = analysisContent.split(' ').slice(0, 8).join(' ') + '...'

      const { error } = await supabase
        .from('thoughts')
        .insert({
          user_id: user.id,
          title,
          content: analysisContent,
          source_type: type,
          source_data: content,
          analysis: analysis.analysis,
          generated_content: JSON.stringify(analysis.content_suggestions),
          tags: analysis.key_themes
        })

      if (error) throw error
      
      await loadThoughts()
      
      // Auto-show the analysis report for the newly created thought
      const { data: newThought } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (newThought) {
        setSelectedThought(newThought)
        setShowReport(true)
      }
    } catch (error) {
      console.error('Error analyzing content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredThoughts = thoughts.filter(thought =>
    thought.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thought.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thought.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
              <button
                onClick={() => window.location.href = '/app/export'}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export My Brain</span>
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
          {/* Input Area */}
          <div className="max-w-2xl mx-auto">
            <InputArea onSubmit={handleAnalyze} loading={loading} />
          </div>

          {/* Thought Library - Now prominently displayed */}
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
                      className="border-0 focus:ring-0 text-gray-900 placeholder-gray-500 w-64"
                    />
                  </div>
                </div>
              </div>
            </div>

            {filteredThoughts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
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
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredThoughts.map((thought, index) => (
                  <motion.div
                    key={thought.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ThoughtCard 
                      thought={thought} 
                      onViewReport={() => {
                        setSelectedThought(thought)
                        setShowReport(true)
                      }}
                      onDelete={(id) => {
                        setThoughts(thoughts.filter(t => t.id !== id))
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Stats moved to bottom */}
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
              <h3 className="font-semibold text-gray-900 mb-3">Avg. per Week</h3>
              <div className="text-3xl font-bold text-green-600">
                {Math.round(thoughts.length / 4) || 0}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {loading && <LoadingAnimation />}
      
      {showReport && selectedThought && (
        <AnalysisReport 
          thought={selectedThought} 
          onClose={() => {
            setShowReport(false)
            setSelectedThought(null)
          }}
        />
      )}
    </div>
  )
}