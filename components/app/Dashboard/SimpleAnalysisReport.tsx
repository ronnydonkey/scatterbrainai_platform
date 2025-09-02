'use client'

import React, { useState } from 'react'
import { X, Copy, Check, Twitter, Linkedin, MessageSquare, Youtube, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react'

interface SimpleAnalysisReportProps {
  thought: {
    id: string
    title: string
    content: string
    analysis: any
    generated_content?: any
    voice_archetype?: string
    authenticity_score?: number
  }
  onClose: () => void
}

export function SimpleAnalysisReport({ thought, onClose }: SimpleAnalysisReportProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState('')

  const handleCopy = (text: string, platform: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPlatform(platform)
    setTimeout(() => setCopiedPlatform(null), 2000)
  }

  const handleFeedback = async (rating: number) => {
    setFeedbackRating(rating)
    
    if (rating <= 3) {
      setShowFeedback(true)
    } else {
      // Submit positive feedback
      await submitFeedback(rating, '')
    }
  }

  const submitFeedback = async (rating: number, text: string) => {
    try {
      await fetch('/api/voice-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: thought.id,
          rating,
          feedbackType: rating >= 4 ? 'positive' : 'needs_improvement',
          specificFeedback: text,
          toneAdjustment: rating <= 2 ? 'needs_adjustment' : undefined
        })
      })
      
      setShowFeedback(false)
      setFeedbackText('')
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  // Safely parse analysis content
  const analysis = thought.analysis || {}
  // Content can be in generated_content (for compatibility) or analysis.content_suggestions
  const content = thought.generated_content || analysis.content_suggestions || {}
  const explorationPaths = analysis.exploration_paths || analysis.explorationPaths || {}
  const voiceMetadata = analysis.voiceMetadata || {}

  const platformIcons = {
    twitter: Twitter,
    x_twitter: Twitter,
    linkedin: Linkedin,
    reddit: MessageSquare,
    youtube: Youtube,
    youtube_script: Youtube
  }

  const platformColors = {
    twitter: 'text-blue-500 bg-blue-50',
    x_twitter: 'text-blue-500 bg-blue-50',
    linkedin: 'text-blue-700 bg-blue-50',
    reddit: 'text-orange-600 bg-orange-50',
    youtube: 'text-red-600 bg-red-50',
    youtube_script: 'text-red-600 bg-red-50'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Analysis Report</h2>
            {voiceMetadata.archetype && (
              <p className="text-sm text-gray-600 mt-1">
                Generated with {voiceMetadata.archetype} voice • 
                {voiceMetadata.authenticityScore && (
                  <span className="text-green-600 ml-1">
                    {Math.round(voiceMetadata.authenticityScore * 100)}% authentic
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Voice Feedback Section */}
          {voiceMetadata.archetype && !feedbackRating && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900 mb-3">
                How well does this content match your voice?
              </p>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFeedback(rating)}
                    className="px-3 py-1 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-sm"
                  >
                    {rating === 1 && '😟'}
                    {rating === 2 && '😕'}
                    {rating === 3 && '😐'}
                    {rating === 4 && '😊'}
                    {rating === 5 && '😍'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Form */}
          {showFeedback && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-900 mb-3">
                What could be improved?
              </p>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what doesn't sound like you..."
                className="w-full p-3 border border-yellow-200 rounded-lg text-sm resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-3 space-x-2">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitFeedback(feedbackRating!, feedbackText)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          )}

          {/* Content Suggestions */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Platform-Optimized Content
            </h3>
            
            {Object.entries(content).map(([platform, text]) => {
              const Icon = platformIcons[platform as keyof typeof platformIcons]
              const colorClass = platformColors[platform as keyof typeof platformColors]
              
              if (!Icon || !text) return null
              
              return (
                <div key={platform} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {platform.replace('x_twitter', 'Twitter/X').replace('youtube_script', 'YouTube').replace('_', ' ')}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleCopy(text as string, platform)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                    >
                      {copiedPlatform === platform ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {copiedPlatform === platform ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{String(text)}</p>
                </div>
              )
            })}
          </div>

          {/* Exploration Paths */}
          {explorationPaths && Object.keys(explorationPaths).length > 0 && (
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Explore Further
              </h3>
              
              {explorationPaths.podcasts && explorationPaths.podcasts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Recommended Podcasts & Videos
                  </h4>
                  <ul className="space-y-1">
                    {explorationPaths.podcasts.map((podcast: string, index: number) => (
                      <li key={index} className="text-gray-700 text-sm">
                        • {podcast}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {explorationPaths.researchers && explorationPaths.researchers.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Key Researchers & Authors
                  </h4>
                  <ul className="space-y-1">
                    {explorationPaths.researchers.map((researcher: string, index: number) => (
                      <li key={index} className="text-gray-700 text-sm">
                        • {researcher}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {explorationPaths.relatedTopics && explorationPaths.relatedTopics.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Related Topics to Explore
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {explorationPaths.relatedTopics.map((topic: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {explorationPaths.practicalApplications && explorationPaths.practicalApplications.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Practical Applications
                  </h4>
                  <ul className="space-y-1">
                    {explorationPaths.practicalApplications.map((application: string, index: number) => (
                      <li key={index} className="text-gray-700 text-sm">
                        • {application}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}