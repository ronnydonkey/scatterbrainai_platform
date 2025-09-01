'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have the necessary confirmation parameters
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    
    if (token_hash && type === 'email') {
      // Email confirmation was successful if we got here
      setStatus('success')
    } else {
      setStatus('error')
    }
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
          >
            <XCircle className="w-8 h-8 text-red-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Confirmation Link</h2>
          <p className="text-gray-600 mb-6">
            This confirmation link is invalid or has expired. Please try signing up again.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
          >
            <span>Back to Sign Up</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Your brain is ready. Let's get you started on your 7-day free trial.
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center mb-3">
            <Brain className="w-8 h-8 text-blue-600 mr-2" />
            <span className="text-xl font-semibold text-gray-900">Welcome to ScatterBrainAI</span>
          </div>
          <p className="text-sm text-gray-600">
            Transform your scattered thoughts into brilliant ideas with the power of AI
          </p>
        </div>

        <Link
          href="/app"
          className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-medium group"
        >
          <span>Continue to Your Brain</span>
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Your 7-day free trial starts now • No credit card required
          </p>
        </div>
      </motion.div>
    </div>
  )
}