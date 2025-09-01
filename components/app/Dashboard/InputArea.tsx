'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Link, Type, Loader2 } from 'lucide-react'

interface InputAreaProps {
  onSubmit: (content: string, type: 'text' | 'url') => Promise<void>
  loading: boolean
}

export function InputArea({ onSubmit, loading }: InputAreaProps) {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'text' | 'url'>('text')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    
    await onSubmit(input.trim(), inputType)
    setInput('')
  }

  const detectInputType = (value: string) => {
    const urlPattern = /^https?:\/\/.+/
    return urlPattern.test(value.trim()) ? 'url' : 'text'
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setInputType(detectInputType(value))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-2 rounded-lg transition-colors ${
            inputType === 'url' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {inputType === 'url' ? <Link className="w-5 h-5" /> : <Type className="w-5 h-5" />}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {inputType === 'url' ? 'URL detected' : 'Text input'}
          </span>
        </div>

        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter your thoughts, ideas, or paste a URL to analyze..."
          className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-500"
          disabled={loading}
        />

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          type="submit"
          disabled={!input.trim() || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing & Generating...</span>
            </>
          ) : (
            <>
              <span>Analyze & Generate</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  )
}