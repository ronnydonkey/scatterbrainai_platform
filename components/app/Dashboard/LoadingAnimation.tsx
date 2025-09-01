'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Zap, Target, Lightbulb } from 'lucide-react'

export function LoadingAnimation() {
  const icons = [
    { Icon: Brain, color: 'text-blue-500', delay: 0 },
    { Icon: Sparkles, color: 'text-purple-500', delay: 0.2 },
    { Icon: Zap, color: 'text-yellow-500', delay: 0.4 },
    { Icon: Target, color: 'text-green-500', delay: 0.6 },
    { Icon: Lightbulb, color: 'text-orange-500', delay: 0.8 }
  ]

  const steps = [
    "Analyzing content structure...",
    "Extracting key insights...",
    "Identifying themes and patterns...",
    "Generating platform content...",
    "Finalizing analysis report..."
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            {/* Central brain icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Orbiting icons */}
            {icons.map(({ Icon, color, delay }, index) => (
              <motion.div
                key={index}
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: delay
                }}
              >
                <div className="relative w-full h-full">
                  <motion.div
                    className={`absolute w-8 h-8 ${color} -top-2 left-1/2 transform -translate-x-1/2`}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: delay
                    }}
                  >
                    <Icon className="w-full h-full" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            AI Brain Processing
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
          >
            Transforming your input into intelligent insights
          </motion.p>
        </div>

        {/* Progress steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5 }}
              className="flex items-center space-x-3 text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.5 + 0.2 }}
                className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
              />
              <motion.span
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.5 + 0.3 }}
                className="text-sm text-gray-700"
              >
                {step}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Pulsing progress bar */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}