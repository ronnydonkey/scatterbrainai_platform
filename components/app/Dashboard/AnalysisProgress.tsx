'use client'

import React, { useEffect, useState } from 'react'
import { Brain, Search, Sparkles, CheckCircle, Clock } from 'lucide-react'

interface AnalysisProgressProps {
  isOpen: boolean
}

const steps = [
  { id: 1, name: 'Understanding your content', icon: Brain, duration: 3000 },
  { id: 2, name: 'Researching key concepts', icon: Search, duration: 8000 },
  { id: 3, name: 'Generating insights', icon: Sparkles, duration: 10000 },
  { id: 4, name: 'Creating platform content', icon: CheckCircle, duration: 9000 }
]

export function AnalysisProgress({ isOpen }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setProgress(0)
      setElapsedTime(0)
      setStepProgress(0)
      return
    }

    const startTime = Date.now()
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    
    // Update elapsed time every 100ms
    const timeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setElapsedTime(elapsed)
      
      // Calculate overall progress
      const overallProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(overallProgress)
      
      // Calculate which step we're on
      let accumulatedTime = 0
      let currentStepIndex = 0
      let stepProgressValue = 0
      
      for (let i = 0; i < steps.length; i++) {
        if (elapsed >= accumulatedTime && elapsed < accumulatedTime + steps[i].duration) {
          currentStepIndex = i
          stepProgressValue = ((elapsed - accumulatedTime) / steps[i].duration) * 100
          break
        } else if (elapsed >= accumulatedTime + steps[i].duration) {
          currentStepIndex = Math.min(i + 1, steps.length - 1)
        }
        accumulatedTime += steps[i].duration
      }
      
      setCurrentStep(currentStepIndex)
      setStepProgress(stepProgressValue)
    }, 100)

    return () => clearInterval(timeInterval)
  }, [isOpen])

  if (!isOpen) return null

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    return `${seconds}s`
  }

  const estimatedRemaining = steps.reduce((sum, step) => sum + step.duration, 0) - elapsedTime
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Content</h3>
            <p className="text-gray-600">This usually takes 25-35 seconds</p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedTime)}
              </span>
              <span>~{formatTime(Math.max(0, estimatedRemaining))} remaining</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep
              
              return (
                <div key={step.id} className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                    ${isComplete ? 'bg-green-100 text-green-600' : 
                      isActive ? 'bg-blue-100 text-blue-600' : 
                      'bg-gray-100 text-gray-400'}
                  `}>
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-gray-900' : 
                        isComplete ? 'text-gray-700' : 
                        'text-gray-500'
                      }`}>
                        {step.name}
                      </p>
                      {isActive && (
                        <span className="text-xs text-gray-500">
                          {Math.round(stepProgress)}%
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <div className="mt-1 bg-gray-200 rounded-full h-1 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-300 ease-out"
                          style={{ width: `${stepProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Fun facts or tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <span className="font-medium">Did you know?</span> Our AI analyzes over 50 dimensions of your content to create authentic, engaging posts for each platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}