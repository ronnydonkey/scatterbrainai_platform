'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Calendar, Tag, ChevronRight, ChevronDown, Brain, Lightbulb, Eye, ArrowRight, Trash2, MoreVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Thought {
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

interface ThoughtCardProps {
  thought: Thought
  onViewReport: () => void
  onDelete: (id: string) => void
}

export function ThoughtCard({ thought, onViewReport, onDelete }: ThoughtCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showGeneratedContent, setShowGeneratedContent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const generatedContent = thought.generated_content ? JSON.parse(thought.generated_content) : null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', thought.id)
      
      if (error) throw error
      onDelete(thought.id)
    } catch (error) {
      console.error('Error deleting thought:', error)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <motion.div
        layout
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {thought.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(thought.created_at)}</span>
                </div>
                {thought.source_type === 'url' && (
                  <div className="flex items-center space-x-1">
                    <ExternalLink className="w-4 h-4" />
                    <span>URL</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onViewReport}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all text-sm font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>View Report</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                
                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 min-w-[160px]"
                    >
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {deleting ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span>{deleting ? 'Deleting...' : 'Delete thought'}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {thought.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {thought.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              {thought.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2.5 py-1">
                  +{thought.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-4">
                      {thought.content}
                    </p>
                    {thought.source_type === 'url' && (
                      <a
                        href={thought.source_data}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Original
                      </a>
                    )}
                  </div>
                </div>

                {thought.analysis && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-gray-900">Quick Analysis</h4>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm line-clamp-3">
                        {thought.analysis}
                      </p>
                    </div>
                  </div>
                )}

                {generatedContent && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        <h4 className="font-medium text-gray-900">Generated Content</h4>
                      </div>
                      <button
                        onClick={() => setShowGeneratedContent(!showGeneratedContent)}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        {showGeneratedContent ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  
                    <AnimatePresence>
                      {showGeneratedContent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-amber-50 rounded-lg p-4 space-y-3"
                        >
                          {Object.entries(generatedContent).map(([platform, content]) => (
                            <div key={platform} className="border-b border-amber-100 last:border-0 pb-3 last:pb-0">
                              <h5 className="font-medium text-amber-900 capitalize mb-1">
                                {platform}
                              </h5>
                              <p className="text-amber-800 text-sm">
                                {content as string}
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div>
                  <button
                    onClick={onViewReport}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Full Analysis Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
  )
}