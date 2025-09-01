'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Share2, 
  Copy, 
  Check,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Users,
  Video,
  FileText,
  ArrowRight,
  Download,
  Star
} from 'lucide-react'

interface AnalysisReportProps {
  thought: {
    id: string
    title: string
    content: string
    source_type: 'text' | 'url'
    source_data: string
    analysis: string | null
    generated_content: string | null
    tags: string[]
    created_at: string
  }
  onClose: () => void
}

export function AnalysisReport({ thought, onClose }: AnalysisReportProps) {
  const [copiedContent, setCopiedContent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('content')

  const generatedContent = thought.generated_content 
    ? JSON.parse(thought.generated_content) 
    : null

  const copyToClipboard = async (content: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedContent(platform)
      setTimeout(() => setCopiedContent(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const platformConfig = {
    x_twitter: {
      name: 'X (Twitter)',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-black text-white',
      description: 'Engaging tweet optimized for social sharing'
    },
    linkedin: {
      name: 'LinkedIn',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-600 text-white',
      description: 'Professional post for business networking'
    },
    reddit: {
      name: 'Reddit',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-orange-500 text-white',
      description: 'Discussion starter for community engagement'
    },
    youtube_script: {
      name: 'YouTube',
      icon: <Video className="w-5 h-5" />,
      color: 'bg-red-600 text-white',
      description: 'Video script hook and introduction'
    }
  }


  const tabs = [
    { id: 'content', label: 'Content', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'overview', label: 'Overview', icon: <Brain className="w-4 h-4" /> },
    { id: 'insights', label: 'Insights', icon: <Lightbulb className="w-4 h-4" /> }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-2xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Analysis Report</h1>
                <p className="text-blue-100">AI-powered insights and content generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Source Information */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-900">Source Material</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Type</h3>
                      <div className="flex items-center space-x-2">
                        {thought.source_type === 'url' ? (
                          <>
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600 font-medium">URL Content</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Text Input</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Word Count</h3>
                      <span className="text-2xl font-bold text-gray-900">
                        {thought.content.split(' ').length.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {thought.source_type === 'url' && (
                    <div className="mt-4">
                      <a
                        href={thought.source_data}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Original Source</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Key Themes */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Target className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Key Themes</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {thought.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-4 py-2 bg-white rounded-full text-purple-700 font-medium shadow-sm border border-purple-100"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* AI Analysis */}
                {thought.analysis && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-amber-600" />
                      <h2 className="text-xl font-bold text-gray-900">AI Analysis</h2>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {thought.analysis}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'content' && generatedContent && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform-Optimized Content</h2>
                  <p className="text-gray-600">Ready-to-publish content tailored for each platform</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(generatedContent).map(([platform, content]) => {
                    const config = platformConfig[platform as keyof typeof platformConfig]
                    if (!config) return null

                    return (
                      <motion.div
                        key={platform}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className={`${config.color} p-4`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {config.icon}
                              <div>
                                <h3 className="font-bold">{config.name}</h3>
                                <p className="text-sm opacity-90">{config.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(content as string, platform)}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                              >
                                {copiedContent === platform ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {content as string}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              {(content as string).length} characters
                            </span>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-gray-600">AI Optimized</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Research Suggestions */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Research Opportunities</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Academic research on AI collaboration',
                      'Case studies on creative AI applications',
                      'Industry reports on AI productivity gains',
                      'Psychological studies on human-AI interaction',
                      'Innovation frameworks for AI integration'
                    ].map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-green-100"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-700">{suggestion}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Connection Opportunities */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Share2 className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">Connection Opportunities</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      'Links to behavioral psychology and decision-making',
                      'Connections to organizational change management',
                      'Relationship to creative problem-solving methodologies',
                      'Implications for future technology adoption',
                      'Cross-industry applications and use cases'
                    ].map((connection, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-indigo-100"
                      >
                        <ArrowRight className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{connection}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Target className="w-6 h-6 text-rose-600" />
                    <h2 className="text-xl font-bold text-gray-900">Next Steps</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      'Experiment with AI collaboration techniques in your daily workflow',
                      'Document your experiences and insights for future reference',
                      'Share your learnings with colleagues or your professional network',
                      'Explore related topics and build connections between ideas',
                      'Apply these insights to current projects or challenges'
                    ].map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-rose-100"
                      >
                        <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{action}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Generated on {new Date(thought.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                Export PDF
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                Save to Library
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}