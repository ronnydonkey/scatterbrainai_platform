'use client'

import React, { useState } from 'react'
import { Plus, Link, FileText } from 'lucide-react'

interface SimpleInputAreaProps {
  onSubmit: (content: string, type: 'text' | 'url') => void
  loading?: boolean
}

export function SimpleInputArea({ onSubmit, loading }: SimpleInputAreaProps) {
  const [inputType, setInputType] = useState<'text' | 'url'>('text')
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && !loading) {
      onSubmit(content.trim(), inputType)
      setContent('')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={() => setInputType('text')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            inputType === 'text'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          <FileText className="w-4 h-4" />
          <span>Text</span>
        </button>
        <button
          onClick={() => setInputType('url')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            inputType === 'url'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          disabled={loading}
        >
          <Link className="w-4 h-4" />
          <span>URL</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {inputType === 'text' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your thoughts, ideas, or paste any content..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32 outline-none text-gray-900 placeholder-gray-500"
            disabled={loading}
          />
        ) : (
          <input
            type="url"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter a URL to analyze..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
            disabled={loading}
          />
        )}

        <button
          type="submit"
          disabled={!content.trim() || loading}
          className={`mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            content.trim() && !loading
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>{loading ? 'Analyzing...' : 'Add to Brain'}</span>
        </button>
      </form>
    </div>
  )
}