'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, CreditCard } from 'lucide-react'
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns'

interface TrialCountdownProps {
  trialEndDate: string
  onUpgrade: () => void
}

export function TrialCountdown({ trialEndDate, onUpgrade }: TrialCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('low')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const endDate = new Date(trialEndDate)
      
      const daysLeft = differenceInDays(endDate, now)
      const hoursLeft = differenceInHours(endDate, now) % 24
      const minutesLeft = differenceInMinutes(endDate, now) % 60

      if (daysLeft <= 0 && hoursLeft <= 0 && minutesLeft <= 0) {
        setTimeRemaining('Trial ended')
        setUrgency('high')
        return
      }

      if (daysLeft > 2) {
        setTimeRemaining(`${daysLeft} days left`)
        setUrgency('low')
      } else if (daysLeft > 0) {
        setTimeRemaining(`${daysLeft} days, ${hoursLeft} hours left`)
        setUrgency('medium')
      } else {
        setTimeRemaining(`${hoursLeft} hours, ${minutesLeft} minutes left`)
        setUrgency('high')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [trialEndDate])

  const bgColor = {
    low: 'bg-blue-50 border-blue-200',
    medium: 'bg-yellow-50 border-yellow-200',
    high: 'bg-red-50 border-red-200'
  }[urgency]

  const textColor = {
    low: 'text-blue-700',
    medium: 'text-yellow-700',
    high: 'text-red-700'
  }[urgency]

  const iconColor = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  }[urgency]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-20 right-4 z-40 p-4 rounded-xl border ${bgColor} shadow-sm`}
    >
      <div className="flex items-start space-x-3">
        <div className={`${iconColor}`}>
          {urgency === 'high' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className={`font-semibold ${textColor}`}>
            Free trial: {timeRemaining}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {urgency === 'high' 
              ? 'Upgrade now to keep your brain active'
              : 'Enjoying ScatterBrainAI? Upgrade anytime'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUpgrade}
            className={`mt-3 flex items-center space-x-2 text-sm font-medium ${
              urgency === 'high' 
                ? 'bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
                : 'text-blue-600 hover:text-blue-700'
            } transition`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{urgency === 'high' ? 'Upgrade Now' : 'View Plans'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}