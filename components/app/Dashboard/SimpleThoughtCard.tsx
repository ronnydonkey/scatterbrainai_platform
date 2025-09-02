'use client'

import React from 'react'
import { Calendar, Tag, Trash2, ExternalLink, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SimpleThoughtCardProps {
  thought: {
    id: string
    title: string
    content: string
    source_type: 'text' | 'url'
    source_data: string
    analysis: any
    tags: string[]
    created_at: string
    voice_archetype?: string
    authenticity_score?: number
  }
  onViewReport: () => void
  onDelete: (id: string) => void
}

export function SimpleThoughtCard({ thought, onViewReport, onDelete }: SimpleThoughtCardProps) {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this thought?')) return

    try {
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', thought.id)

      if (error) throw error
      onDelete(thought.id)
    } catch (error) {
      console.error('Error deleting thought:', error)
    }
  }

  const formattedDate = new Date(thought.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
          {thought.title}
        </h3>
        {thought.voice_archetype && (
          <div className="ml-2 flex items-center space-x-1 text-purple-600">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium capitalize">{thought.voice_archetype}</span>
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {thought.content}
      </p>

      <div className="flex items-center space-x-3 text-xs text-gray-500 mb-4">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
        {thought.source_type === 'url' && (
          <div className="flex items-center space-x-1">
            <ExternalLink className="w-3 h-3" />
            <span>URL</span>
          </div>
        )}
        {thought.authenticity_score && (
          <div className="flex items-center space-x-1">
            <span className="text-green-600">
              {Math.round(thought.authenticity_score * 100)}% authentic
            </span>
          </div>
        )}
      </div>

      {thought.tags && thought.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {thought.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
            >
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
            </span>
          ))}
          {thought.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{thought.tags.length - 3} more</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onViewReport}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Analysis
        </button>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}