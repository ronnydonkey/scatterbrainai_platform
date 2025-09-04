'use client'

import React from 'react'
import { Brain, Search, Sparkles, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface StreamingAnalysisProgressProps {
  isOpen: boolean
  stage: 'idle' | 'research' | 'analysis' | 'content' | 'complete' | 'error'
  error?: string | null
  timing?: {
    research?: number
    analysis?: number
    content?: number
  }
  onRetry?: () => void
}

const steps = [
  { id: 'research', name: 'Research Agent: Extracting key information', icon: Search },
  { id: 'analysis', name: 'Analysis Agent: Finding patterns & connections', icon: Brain },
  { id: 'content', name: 'Content Agent: Creating beautiful insights', icon: Sparkles }
]

export function StreamingAnalysisProgress({ 
  isOpen, 
  stage, 
  error, 
  timing,
  onRetry 
}: StreamingAnalysisProgressProps) {
  
  if (!isOpen) return null

  const getStepStatus = (stepId: string) => {
    if (stage === 'error') return 'error'
    if (stage === 'complete') return 'complete'
    
    const stageOrder = ['research', 'analysis', 'content']
    const currentIndex = stageOrder.indexOf(stage)
    const stepIndex = stageOrder.indexOf(stepId)
    
    if (stepIndex < currentIndex) return 'complete'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const formatTime = (ms?: number) => {
    if (!ms) return '0s'
    return `${(ms / 1000).toFixed(1)}s`
  }

  const totalTime = (timing?.research || 0) + (timing?.analysis || 0) + (timing?.content || 0)
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? 'Analysis Failed' : 'Analyzing Your Content'}
            </h3>
            {!error && stage !== 'complete' && (
              <p className="text-gray-600">Our 3-agent AI pipeline is processing your thoughts</p>
            )}
            {stage === 'complete' && (
              <p className="text-green-600 font-medium">Analysis complete in {formatTime(totalTime)}!</p>
            )}
          </div>

          {error ? (
            /* Error Message */
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800">{error}</p>
                  {error.includes('shorten') && (
                    <p className="text-red-600 text-sm mt-2">
                      Tip: Try breaking your content into smaller chunks
                    </p>
                  )}
                </div>
              </div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Real-time Steps */}
              <div className="space-y-4">
                {steps.map((step) => {
                  const Icon = step.icon
                  const status = getStepStatus(step.id)
                  const stepTime = timing?.[step.id as keyof typeof timing]
                  
                  return (
                    <div key={step.id} className="flex items-center space-x-3">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                        ${status === 'complete' ? 'bg-green-100 text-green-600' : 
                          status === 'active' ? 'bg-blue-100 text-blue-600' : 
                          status === 'error' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-400'}
                      `}>
                        {status === 'complete' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : status === 'error' ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <Icon className={`w-5 h-5 ${status === 'active' ? 'animate-pulse' : ''}`} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            status === 'active' ? 'text-gray-900' : 
                            status === 'complete' ? 'text-gray-700' : 
                            status === 'error' ? 'text-red-700' :
                            'text-gray-500'
                          }`}>
                            {step.name}
                          </p>
                          {stepTime && (
                            <span className="text-xs text-gray-500">
                              {formatTime(stepTime)}
                            </span>
                          )}
                        </div>
                        {status === 'active' && (
                          <div className="mt-1">
                            <div className="bg-gray-200 rounded-full h-1 overflow-hidden">
                              <div className="bg-blue-500 h-full animate-pulse" style={{ width: '100%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress Summary */}
              {stage !== 'idle' && stage !== 'complete' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-900">
                      Processing... Each agent typically takes 1-3 seconds
                    </p>
                  </div>
                </div>
              )}

              {/* Success Summary */}
              {stage === 'complete' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-900 text-center">
                    <span className="font-medium">Success!</span> Your content has been analyzed and insights generated.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}