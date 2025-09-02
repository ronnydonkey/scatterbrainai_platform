'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Search, Sparkles, Compass } from 'lucide-react'

interface LoadingStep {
  id: string
  icon: React.ReactNode
  label: string
  duration: number
}

const steps: LoadingStep[] = [
  {
    id: 'research',
    icon: <Search className="w-5 h-5" />,
    label: 'Conducting deep research analysis',
    duration: 3000
  },
  {
    id: 'content',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Generating sophisticated content',
    duration: 4000
  },
  {
    id: 'exploration',
    icon: <Compass className="w-5 h-5" />,
    label: 'Building exploration paths',
    duration: 2000
  }
]

export function EnhancedLoadingState() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    let totalTime = 0
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index)
        if (index > 0) {
          setCompletedSteps(prev => [...prev, index - 1])
        }
      }, totalTime)
      totalTime += step.duration
    })

    // Complete the last step
    setTimeout(() => {
      setCompletedSteps(prev => [...prev, steps.length - 1])
    }, totalTime)
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
      </div>
      
      <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">
        Analyzing with Premium Intelligence
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index)
          const isActive = currentStep === index
          const isPending = index > currentStep

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`
                flex items-center space-x-4 p-4 rounded-lg transition-all duration-300
                ${isCompleted ? 'bg-green-50 border border-green-200' : ''}
                ${isActive ? 'bg-blue-50 border border-blue-200 shadow-md' : ''}
                ${isPending ? 'bg-gray-50 border border-gray-200 opacity-60' : ''}
              `}
            >
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isActive ? 'bg-blue-500 text-white' : ''}
                ${isPending ? 'bg-gray-300 text-gray-500' : ''}
              `}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <div className={isActive ? 'animate-spin' : ''}>
                    {step.icon}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className={`
                  font-medium
                  ${isCompleted ? 'text-green-700' : ''}
                  ${isActive ? 'text-blue-700' : ''}
                  ${isPending ? 'text-gray-500' : ''}
                `}>
                  {step.label}
                </p>
                {isActive && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: step.duration / 1000, ease: 'linear' }}
                    />
                  </div>
                )}
              </div>

              <div className="text-sm">
                {isCompleted && <span className="text-green-600 font-medium">Complete</span>}
                {isActive && <span className="text-blue-600 font-medium">Processing...</span>}
                {isPending && <span className="text-gray-400">Pending</span>}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Using Claude 3.5 Sonnet for research-grade analysis
        </p>
        <div className="flex justify-center mt-2 space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}