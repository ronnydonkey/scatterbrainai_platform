'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, PenTool, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const writingPrompts = [
  {
    id: 1,
    title: "Your Morning Routine",
    prompt: "Describe your ideal morning routine in 2-3 sentences. What gets you energized for the day?",
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 2,
    title: "A Recent Discovery",
    prompt: "Tell us about something interesting you learned recently. How did it change your perspective?",
    icon: <PenTool className="w-5 h-5" />
  },
  {
    id: 3,
    title: "Your Superpower",
    prompt: "If you could have any superpower for just one day, what would it be and what would you do with it?",
    icon: <MessageSquare className="w-5 h-5" />
  }
]

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<string[]>(['', '', ''])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleNext = () => {
    if (currentStep < writingPrompts.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const writingStyle = responses.join('\n\n')
      
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          writing_style: writingStyle,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
      
      onComplete()
    } catch (error) {
      console.error('Error saving writing style:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateResponse = (value: string) => {
    const newResponses = [...responses]
    newResponses[currentStep] = value
    setResponses(newResponses)
  }

  const currentPrompt = writingPrompts[currentStep]
  const isLastStep = currentStep === writingPrompts.length - 1
  const canProceed = responses[currentStep].trim().length > 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl"
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Let&apos;s Learn Your Voice</h2>
            <span className="text-sm text-gray-500">
              {currentStep + 1} of {writingPrompts.length}
            </span>
          </div>
          <div className="flex space-x-2">
            {writingPrompts.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-all ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                {currentPrompt.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{currentPrompt.title}</h3>
                <p className="text-gray-600">{currentPrompt.prompt}</p>
              </div>
            </div>

            <textarea
              value={responses[currentStep]}
              onChange={(e) => updateResponse(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              placeholder="Share your thoughts..."
            />

            <div className="text-sm text-gray-500">
              {responses[currentStep].length} characters
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLastStep ? 'Complete' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}