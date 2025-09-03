'use client'

import React, { useState } from 'react'
import { X, Copy, Check, Twitter, Linkedin, MessageSquare, Youtube, TrendingUp, Users, Target, Award, Zap, Heart, Lightbulb, BookOpen, Sparkles } from 'lucide-react'

interface CleanAnalysisReportProps {
  thought: {
    id: string
    title: string
    content: string
    analysis: any
    generated_content?: any
    voice_archetype?: string
    authenticity_score?: number
  }
  onClose: () => void
}

export function CleanAnalysisReport({ thought, onClose }: CleanAnalysisReportProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)

  const handleCopy = (text: string, platform: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPlatform(platform)
    setTimeout(() => setCopiedPlatform(null), 2000)
  }

  // Format YouTube content if it's an object
  const formatYouTubeContent = (content: any): string => {
    if (typeof content === 'string') return content;
    
    if (content && typeof content === 'object') {
      let formatted = '';
      
      if (content.title) {
        formatted += `Title: ${content.title}\n\n`;
      }
      
      if (content.description) {
        formatted += `Description:\n${content.description}\n\n`;
      }
      
      if (content.hook_script) {
        formatted += `Hook Script:\n${content.hook_script}\n\n`;
      }
      
      if (content.main_points && Array.isArray(content.main_points)) {
        formatted += `Main Points:\n${content.main_points.map((point: any, index: number) => 
          `${index + 1}. ${point}`
        ).join('\n')}\n\n`;
      }
      
      if (content.examples) {
        formatted += `Examples:\n${content.examples}\n\n`;
      }
      
      if (content.conclusion_script) {
        formatted += `Conclusion:\n${content.conclusion_script}\n\n`;
      }
      
      if (content.end_screen) {
        formatted += `End Screen:\n${content.end_screen}`;
      }
      
      return formatted.trim();
    }
    
    return '';
  }

  // Safely parse analysis content
  const analysis = thought.analysis || {}
  
  // Detect content type based on analysis
  const detectContentType = () => {
    const analysisText = JSON.stringify(analysis).toLowerCase();
    const tags = analysis.key_themes || analysis.tags || [];
    const tagsText = tags.join(' ').toLowerCase();
    const domain = (analysis.researchContext?.domain || '').toLowerCase();
    
    // Check for personal/creative/wellness content indicators
    const personalIndicators = [
      'personal', 'memoir', 'story', 'journey', 'experience', 'reflection',
      'creative', 'creativity', 'artistic', 'writing', 'art', 'music',
      'mental health', 'wellness', 'recovery', 'healing', 'therapy', 'addiction',
      'self-care', 'mindfulness', 'meditation', 'spiritual', 'growth',
      'emotion', 'feeling', 'vulnerability', 'authentic', 'identity'
    ];
    
    // Check for business content indicators
    const businessIndicators = [
      'business', 'market', 'strategy', 'product', 'startup', 'revenue',
      'competitive', 'analysis', 'opportunity', 'investment', 'growth',
      'customer', 'sales', 'marketing', 'profit', 'scalable', 'saas',
      'b2b', 'b2c', 'enterprise', 'monetization', 'venture'
    ];
    
    const hasPersonalIndicators = personalIndicators.some(indicator => 
      analysisText.includes(indicator) || tagsText.includes(indicator) || domain.includes(indicator)
    );
    
    const hasBusinessIndicators = businessIndicators.some(indicator => 
      analysisText.includes(indicator) || tagsText.includes(indicator) || domain.includes(indicator)
    );
    
    // If it has personal indicators and no strong business focus, treat as personal
    // If it has business indicators but also creative/personal elements, check the balance
    if (hasPersonalIndicators && !hasBusinessIndicators) {
      return 'personal';
    } else if (hasBusinessIndicators && !hasPersonalIndicators) {
      return 'business';
    } else if (hasPersonalIndicators && hasBusinessIndicators) {
      // For mixed content, check if it's primarily about creative/personal aspects
      const creativeBusinessTerms = ['creative business', 'artistic entrepreneurship', 'creative revenue'];
      const hasCreativeBusiness = creativeBusinessTerms.some(term => analysisText.includes(term));
      return hasCreativeBusiness ? 'personal' : 'business';
    }
    
    // Default to personal for unclear content
    return 'personal';
  };
  
  const contentType = detectContentType();
  
  // Parse generated_content if it's a string
  let parsedGeneratedContent = thought.generated_content
  if (typeof thought.generated_content === 'string') {
    try {
      parsedGeneratedContent = JSON.parse(thought.generated_content)
    } catch (e) {
      console.error('Failed to parse generated_content:', e)
      parsedGeneratedContent = {}
    }
  }
  
  const content = parsedGeneratedContent || analysis.content_suggestions || {}
  const explorationPaths = analysis.exploration_paths || analysis.explorationPaths || {}

  // Extract scores from analysis or use defaults
  const qualityScore = analysis.quality_score || 92
  const engagementScore = analysis.engagement_score || 88
  const insightScore = analysis.insight_score || 95
  const opportunityScore = analysis.opportunity_score || 9

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-50 rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Content Analysis Report</h2>
            <p className="text-sm text-gray-500">AI-powered insights and recommendations</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
          {/* Content Analysis Section - Conditional based on content type */}
          <div className="px-8 py-6">
            {contentType === 'business' ? (
              /* Business Opportunity Score */
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Opportunity Score</h3>
                    <p className="text-sm text-gray-500 mt-1">AI analysis of content potential and market fit</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Overall Rating</div>
                    <div className="text-3xl font-bold text-gray-900">{opportunityScore}</div>
                    <div className="text-sm text-green-600">/ 10</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Content Quality</span>
                      <span className="text-sm text-gray-900">{qualityScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${qualityScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Engagement Potential</span>
                      <span className="text-sm text-gray-900">{engagementScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${engagementScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Market Demand</span>
                      <span className="text-sm text-gray-900">{insightScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${insightScore}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="mt-6 flex justify-center">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                    <Zap className="w-5 h-5" />
                    <span>Build This Idea</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Personal/Creative Content Analysis */
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Content Insights</h3>
                    <p className="text-sm text-gray-500 mt-1">AI analysis of themes and resonance</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <Sparkles className="w-5 h-5 text-purple-500" />
                  </div>
                </div>

                {/* Key Themes */}
                {(analysis.key_themes || analysis.tags || []).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Key Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.key_themes || analysis.tags || []).map((theme: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emotional Resonance */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Emotional Resonance</span>
                      <span className="text-sm text-gray-900">Strong</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-pink-500 rounded-full transition-all duration-500"
                        style={{ width: '85%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Authenticity</span>
                      <span className="text-sm text-gray-900">Very High</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: '92%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Connection Potential</span>
                      <span className="text-sm text-gray-900">Excellent</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: '88%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                {analysis.analysis && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-purple-600" />
                      Key Insight
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {typeof analysis.analysis === 'string' 
                        ? analysis.analysis.slice(0, 200) + '...'
                        : 'This content explores deep themes of human experience and connection.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Platform-Optimized Content */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Platform-Optimized Content</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Twitter/X Card */}
              {(content.twitter || content.x_twitter) && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Twitter className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Twitter/X</h4>
                        <p className="text-xs text-gray-500">Optimized for engagement</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const twitterContent = content.twitter || content.x_twitter;
                        const textContent = typeof twitterContent === 'string' ? twitterContent : JSON.stringify(twitterContent);
                        handleCopy(textContent, 'twitter');
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {copiedPlatform === 'twitter' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {typeof (content.twitter || content.x_twitter) === 'string' 
                        ? (content.twitter || content.x_twitter)
                        : JSON.stringify(content.twitter || content.x_twitter, null, 2)}
                    </p>
                  </div>
                </div>
              )}

              {/* LinkedIn Card */}
              {content.linkedin && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Linkedin className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">LinkedIn</h4>
                        <p className="text-xs text-gray-500">Professional network content</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const linkedinContent = content.linkedin;
                        const textContent = typeof linkedinContent === 'string' ? linkedinContent : JSON.stringify(linkedinContent);
                        handleCopy(textContent, 'linkedin');
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {copiedPlatform === 'linkedin' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {typeof content.linkedin === 'string' 
                        ? content.linkedin
                        : JSON.stringify(content.linkedin, null, 2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Reddit Card */}
              {content.reddit && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Reddit</h4>
                        <p className="text-xs text-gray-500">Community discussion starter</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const redditContent = content.reddit;
                        const textContent = typeof redditContent === 'string' ? redditContent : JSON.stringify(redditContent);
                        handleCopy(textContent, 'reddit');
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {copiedPlatform === 'reddit' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {typeof content.reddit === 'string' 
                        ? content.reddit
                        : JSON.stringify(content.reddit, null, 2)}
                    </p>
                  </div>
                </div>
              )}

              {/* YouTube Card */}
              {(content.youtube || content.youtube_script) && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Youtube className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">YouTube</h4>
                        <p className="text-xs text-gray-500">Video script outline</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const youtubeContent = content.youtube || content.youtube_script;
                        const textContent = typeof youtubeContent === 'string' 
                          ? youtubeContent 
                          : formatYouTubeContent(youtubeContent);
                        handleCopy(textContent, 'youtube');
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      {copiedPlatform === 'youtube' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {(() => {
                        const youtubeContent = content.youtube || content.youtube_script;
                        if (typeof youtubeContent === 'string') {
                          return youtubeContent;
                        } else if (youtubeContent && typeof youtubeContent === 'object') {
                          return formatYouTubeContent(youtubeContent);
                        }
                        return '';
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis & Research Paths */}
          <div className="px-8 py-6">
            {contentType === 'business' ? (
              /* Business Market Analysis */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Analysis */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Analysis</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Market Timing</span>
                        <span className="text-sm font-medium text-gray-900">Excellent</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Market Potential</span>
                        <span className="text-sm font-medium text-gray-900">High Growth</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitive Position */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Position</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Unique Advantage</span>
                        <span className="text-sm font-medium text-gray-900">Strong</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-700">Execution Feasibility</span>
                        <span className="text-sm font-medium text-gray-900">Very High</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Personal/Creative Content Connections */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Takeaways */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Key Takeaways
                  </h3>
                  
                  <ul className="space-y-3">
                    {(analysis.insights || analysis.research_suggestions || []).slice(0, 4).map((insight: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        <span className="text-sm text-gray-700">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connection Opportunities */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    Connection Opportunities
                  </h3>
                  
                  <div className="space-y-3">
                    {(analysis.connections || analysis.crossDisciplinaryConnections || [
                      'Share your story to inspire others on similar journeys',
                      'Connect with communities exploring these themes',
                      'Use your experience to help others heal',
                      'Create content that resonates with shared experiences'
                    ]).slice(0, 4).map((connection: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <span className="text-pink-500 mr-2">•</span>
                        <span className="text-sm text-gray-700">{connection}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Research Paths */}
            {explorationPaths && Object.keys(explorationPaths).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Further Research</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {explorationPaths.relatedTopics && explorationPaths.relatedTopics.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 text-sm">Related Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {explorationPaths.relatedTopics.map((topic: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {explorationPaths.researchers && explorationPaths.researchers.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 text-sm">Key Researchers</h4>
                      <ul className="space-y-1">
                        {explorationPaths.researchers.slice(0, 4).map((researcher: string, index: number) => (
                          <li key={index} className="text-gray-600 text-xs">
                            • {researcher}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}