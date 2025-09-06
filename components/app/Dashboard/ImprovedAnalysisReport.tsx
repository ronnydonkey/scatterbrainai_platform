'use client'

import React, { useState } from 'react'
import { X, Copy, Check, Lightbulb, Target, Link, TrendingUp, BookOpen, Users, Sparkles, ChevronRight, Twitter, Linkedin, MessageSquare, Youtube } from 'lucide-react'

interface ImprovedAnalysisReportProps {
  thought: {
    id: string
    title: string
    content: string
    analysis: any
    generated_content?: any
  }
  onClose: () => void
}

export function ImprovedAnalysisReport({ thought, onClose }: ImprovedAnalysisReportProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'content' | 'overview'>('overview')
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  // Debug logging
  console.log('ImprovedAnalysisReport - thought:', thought)
  console.log('ImprovedAnalysisReport - analysis:', thought.analysis)
  console.log('ImprovedAnalysisReport - generated_content:', thought.generated_content)

  const analysis = thought.analysis || {}
  
  // Parse generated_content if it's a string
  let content = thought.generated_content
  if (typeof thought.generated_content === 'string') {
    try {
      content = JSON.parse(thought.generated_content)
    } catch {
      content = {}
    }
  }
  content = content || analysis.content_suggestions || {}

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  // Extract data from analysis - handle the actual API structure
  const summary = {
    headline: thought.title || 'Analysis Report',
    description: analysis.analysis || analysis.key_insight || ''
  }
  const insights = analysis.insights || []
  const themes = analysis.key_themes || analysis.themes || []
  const actionItems = analysis.action_items || []
  const researchOpportunities = analysis.research_suggestions || []
  const connectionOpportunities = analysis.connections || []

  console.log('Extracted data:', {
    summary,
    insights,
    themes,
    actionItems,
    researchOpportunities,
    connectionOpportunities
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analysis Report</h2>
              <p className="text-sm text-gray-600 mt-1">AI-powered insights and content generation</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'insights'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'content'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Content
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Card */}
              {summary.headline && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{summary.headline}</h3>
                      <p className="text-gray-700 leading-relaxed">{summary.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Themes */}
              {themes.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Key Themes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">{insights.length}</div>
                  <div className="text-sm text-blue-600 mt-1">Key Insights</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{actionItems.length}</div>
                  <div className="text-sm text-green-600 mt-1">Action Items</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {Object.keys(content).filter(k => content[k]).length}
                  </div>
                  <div className="text-sm text-purple-600 mt-1">Platforms</div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-8">
              {/* Key Insights */}
              {insights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="text-yellow-500 mt-1">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                        <p className="text-gray-700 leading-relaxed flex-1">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {actionItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Action Items
                  </h3>
                  <div className="space-y-3">
                    {actionItems.map((item: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="text-green-600 mt-1">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                        <p className="text-gray-700 leading-relaxed flex-1">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Opportunities */}
              {researchOpportunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Research Opportunities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {researchOpportunities.map((opp: string, index: number) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <p className="text-gray-700">{opp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connection Opportunities */}
              {connectionOpportunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Link className="w-5 h-5 mr-2 text-purple-600" />
                    Connection Opportunities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connectionOpportunities.map((conn: string, index: number) => (
                      <div key={index} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <p className="text-gray-700">{conn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <p className="text-gray-600 mb-6">
                Platform-optimized content ready to copy and share
              </p>

              {/* Twitter/X */}
              {(content.twitter || content.x_twitter) && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Twitter className="w-5 h-5 text-blue-500" />
                      <h4 className="font-medium text-gray-900">Twitter/X</h4>
                    </div>
                    <button
                      onClick={() => handleCopy(content.twitter || content.x_twitter, 'twitter')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {copiedSection === 'twitter' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {copiedSection === 'twitter' ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {content.twitter || content.x_twitter}
                    </p>
                  </div>
                </div>
              )}

              {/* LinkedIn */}
              {content.linkedin && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Linkedin className="w-5 h-5 text-blue-700" />
                      <h4 className="font-medium text-gray-900">LinkedIn</h4>
                    </div>
                    <button
                      onClick={() => handleCopy(content.linkedin, 'linkedin')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {copiedSection === 'linkedin' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {copiedSection === 'linkedin' ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-gray-700 whitespace-pre-wrap">{content.linkedin}</p>
                  </div>
                </div>
              )}

              {/* Reddit */}
              {content.reddit && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-orange-600" />
                      <h4 className="font-medium text-gray-900">Reddit</h4>
                    </div>
                    <button
                      onClick={() => handleCopy(content.reddit, 'reddit')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {copiedSection === 'reddit' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {copiedSection === 'reddit' ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-gray-700 whitespace-pre-wrap">{content.reddit}</p>
                  </div>
                </div>
              )}

              {/* YouTube */}
              {(content.youtube || content.youtube_script) && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Youtube className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-gray-900">YouTube Script</h4>
                    </div>
                    <button
                      onClick={() => handleCopy(content.youtube || content.youtube_script, 'youtube')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {copiedSection === 'youtube' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {copiedSection === 'youtube' ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {content.youtube || content.youtube_script}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}