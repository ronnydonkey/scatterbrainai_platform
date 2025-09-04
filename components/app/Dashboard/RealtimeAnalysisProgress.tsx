'use client'

import React, { useEffect, useState } from 'react'
import { Twitter, Linkedin, MessageSquare, Youtube, TrendingUp, Users, Hash, Sparkles, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface RealtimeAnalysisProgressProps {
  isOpen: boolean
  isProcessing: boolean
  error?: string | null
  onRetry?: () => void
}

const steps = [
  { 
    id: 'understanding',
    name: 'Understanding your content', 
    description: 'Extracting key themes and insights',
    icon: Sparkles,
    minDuration: 3000,
    maxDuration: 5000
  },
  { 
    id: 'twitter',
    name: 'Optimizing for Twitter/X', 
    description: 'Creating engaging threads and viral hooks',
    icon: Twitter,
    minDuration: 4000,
    maxDuration: 7000
  },
  { 
    id: 'linkedin',
    name: 'Crafting LinkedIn content', 
    description: 'Professional tone with thought leadership angle',
    icon: Linkedin,
    minDuration: 4000,
    maxDuration: 6000
  },
  { 
    id: 'reddit',
    name: 'Reddit community voice', 
    description: 'Authentic discussion starter format',
    icon: MessageSquare,
    minDuration: 3000,
    maxDuration: 5000
  },
  { 
    id: 'youtube',
    name: 'YouTube script outline', 
    description: 'Hook, story structure, and call-to-action',
    icon: Youtube,
    minDuration: 4000,
    maxDuration: 6000
  },
  { 
    id: 'finalizing',
    name: 'Finalizing your content', 
    description: 'Applying finishing touches',
    icon: CheckCircle,
    minDuration: 2000,
    maxDuration: 3000
  }
]

export function RealtimeAnalysisProgress({ 
  isOpen, 
  isProcessing,
  error, 
  onRetry 
}: RealtimeAnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [stepProgress, setStepProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [elapsedTime, setElapsedTime] = useState(0)
  
  useEffect(() => {
    if (!isOpen || !isProcessing) {
      setCurrentStep(-1)
      setStepProgress(0)
      setCompletedSteps(new Set())
      setElapsedTime(0)
      return
    }

    const startTime = Date.now()
    let stepIndex = 0
    let stepStartTime = Date.now()
    
    // Calculate random durations for each step
    const stepDurations = steps.map(step => 
      Math.random() * (step.maxDuration - step.minDuration) + step.minDuration
    )
    
    const totalDuration = stepDurations.reduce((sum, duration) => sum + duration, 0)
    
    // Progress through steps
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setElapsedTime(elapsed)
      
      // Check if we're still processing
      if (!isProcessing && currentStep === steps.length - 1) {
        clearInterval(progressInterval)
        return
      }
      
      // Calculate current step based on elapsed time
      let accumulatedTime = 0
      let newStepIndex = 0
      
      for (let i = 0; i < steps.length; i++) {
        if (elapsed < accumulatedTime + stepDurations[i]) {
          newStepIndex = i
          const stepElapsed = elapsed - accumulatedTime
          const progress = (stepElapsed / stepDurations[i]) * 100
          setStepProgress(Math.min(progress, 100))
          break
        }
        accumulatedTime += stepDurations[i]
        if (i < steps.length - 1) {
          completedSteps.add(steps[i].id)
        }
      }
      
      // If we're on the last step and still processing, keep it active
      if (elapsed >= totalDuration && isProcessing) {
        newStepIndex = steps.length - 1
        setStepProgress(80) // Keep at 80% until actually complete
      }
      
      if (newStepIndex !== stepIndex) {
        stepIndex = newStepIndex
        setCurrentStep(stepIndex)
        stepStartTime = Date.now()
        if (stepIndex > 0) {
          setCompletedSteps(new Set(completedSteps).add(steps[stepIndex - 1].id))
        }
      }
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isOpen, isProcessing, currentStep, completedSteps])

  if (!isOpen) return null

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    return `${seconds}s`
  }

  const getStepStatus = (stepId: string, index: number) => {
    if (error) return 'error'
    if (completedSteps.has(stepId)) return 'complete'
    if (index === currentStep) return 'active'
    if (index < currentStep) return 'complete'
    return 'pending'
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? 'Analysis Failed' : 'Creating Your Content'}
            </h3>
            {!error && (
              <p className="text-gray-600">
                Optimizing for maximum engagement across platforms
              </p>
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
              {/* Progress Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const status = getStepStatus(step.id, index)
                  
                  return (
                    <div key={step.id} className="flex items-start space-x-3">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 flex-shrink-0
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
                          <div>
                            <p className={`text-sm font-medium ${
                              status === 'active' ? 'text-gray-900' : 
                              status === 'complete' ? 'text-gray-700' : 
                              status === 'error' ? 'text-red-700' :
                              'text-gray-500'
                            }`}>
                              {step.name}
                            </p>
                            {status === 'active' && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {status === 'active' && (
                          <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full transition-all duration-300 ease-out"
                                style={{ width: `${stepProgress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Time Indicator */}
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Elapsed time: {formatTime(elapsedTime)}</span>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">💡 Pro tip:</span> Each platform has its own culture and best practices. We're customizing your content to maximize engagement on each one.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}