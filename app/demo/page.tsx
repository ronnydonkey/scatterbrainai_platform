'use client'

import { useState } from 'react'
import { Brain, FileText, Download, Sparkles, Link, Send, Plus } from 'lucide-react'

export default function DemoPage() {
  const [thoughts, setThoughts] = useState<any[]>([
    {
      id: '1',
      title: 'Welcome to ScatterBrainAI',
      content: 'This is a demo version that works without authentication. Try adding a thought!',
      source_type: 'text',
      analysis: 'This is an introductory message to help users understand the platform.',
      tags: ['welcome', 'demo'],
      created_at: new Date().toISOString()
    }
  ])
  const [inputType, setInputType] = useState<'text' | 'url'>('text')
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async () => {
    if (!inputValue.trim()) return

    setIsProcessing(true)
    
    // Simulate processing
    setTimeout(() => {
      const newThought = {
        id: Date.now().toString(),
        title: inputType === 'text' ? inputValue.slice(0, 50) + '...' : new URL(inputValue).hostname,
        content: inputValue,
        source_type: inputType,
        analysis: 'This thought contains interesting insights about ' + (inputType === 'text' ? 'your ideas' : 'web content'),
        tags: ['demo', inputType],
        created_at: new Date().toISOString()
      }
      
      setThoughts([newThought, ...thoughts])
      setInputValue('')
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">ScatterBrainAI Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo Mode - No Auth Required</span>
              <a href="/" className="text-sm text-blue-600 hover:text-blue-700">Exit Demo</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Capture a Thought</h2>
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setInputType('text')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    inputType === 'text'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => setInputType('url')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    inputType === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Link className="w-4 h-4" />
                  <span>URL</span>
                </button>
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputType === 'text' ? 'Enter your thought...' : 'Paste a URL...'}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                rows={inputType === 'text' ? 6 : 2}
              />

              <button
                onClick={handleSubmit}
                disabled={isProcessing || !inputValue.trim()}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Add Thought</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Thoughts List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Thoughts</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="space-y-4">
              {thoughts.map((thought) => (
                <div key={thought.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{thought.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(thought.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{thought.content}</p>
                  
                  {thought.analysis && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">AI Analysis</span>
                      </div>
                      <p className="text-sm text-blue-800">{thought.analysis}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      {thought.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}