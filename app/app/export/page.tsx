'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Package, FileJson, Table, Brain, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const exportFormats = [
  {
    id: 'raw_text',
    icon: FileText,
    title: 'Raw Text',
    description: 'All your thoughts in chronological order as plain text',
    extension: '.txt'
  },
  {
    id: 'organized_clusters',
    icon: Package,
    title: 'Organized Clusters',
    description: 'Thoughts grouped by themes and connections',
    extension: '.txt'
  },
  {
    id: 'social_content',
    icon: Brain,
    title: 'Generated Content',
    description: 'All AI-generated social media posts',
    extension: '.txt'
  },
  {
    id: 'json',
    icon: FileJson,
    title: 'JSON Export',
    description: 'Complete data in machine-readable format',
    extension: '.json'
  },
  {
    id: 'csv',
    icon: Table,
    title: 'CSV Export',
    description: 'Spreadsheet-friendly format for analysis',
    extension: '.csv'
  }
]

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
  user_id: string
}

export default function ExportPage() {
  const { user } = useAuth()
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [exporting, setExporting] = useState<string | null>(null)
  const [completed, setCompleted] = useState<string[]>([])

  const loadThoughts = async () => {
    const { data } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    
    setThoughts(data || [])
  }

  useEffect(() => {
    if (user) {
      loadThoughts()
    }
  }, [user, loadThoughts])

  const exportData = async (format: string) => {
    setExporting(format)
    
    try {
      let content = ''
      const filename = `scatterbrain-export-${new Date().toISOString().split('T')[0]}`
      
      switch (format) {
        case 'raw_text':
          content = thoughts.map(t => 
            `${new Date(t.created_at).toLocaleString()}\n${t.title}\n\n${t.content}\n\n---\n`
          ).join('\n')
          break
          
        case 'organized_clusters':
          const themes = [...new Set(thoughts.flatMap(t => t.tags || []))]
          content = themes.map(theme => {
            const themed = thoughts.filter(t => t.tags?.includes(theme))
            return `## ${theme}\n\n${themed.map(t => `- ${t.title}\n  ${t.content}`).join('\n\n')}`
          }).join('\n\n---\n\n')
          break
          
        case 'social_content':
          content = thoughts.filter(t => t.generated_content).map(t => {
            const gen = JSON.parse(t.generated_content || '{}')
            return `Original: ${t.title}\n\nTwitter:\n${gen.x_twitter || ''}\n\nLinkedIn:\n${gen.linkedin || ''}\n\nReddit:\n${gen.reddit || ''}\n\n---\n`
          }).join('\n')
          break
          
        case 'json':
          content = JSON.stringify(thoughts, null, 2)
          break
          
        case 'csv':
          const headers = ['Created', 'Title', 'Content', 'Type', 'Tags', 'Analysis']
          const rows = thoughts.map(t => [
            new Date(t.created_at).toLocaleString(),
            t.title,
            t.content.replace(/,/g, ';'),
            t.source_type,
            (t.tags || []).join(';'),
            (t.analysis || '').replace(/,/g, ';')
          ])
          content = [headers, ...rows].map(row => row.join(',')).join('\n')
          break
      }
      
      // Create blob and download
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename + exportFormats.find(f => f.id === format)?.extension
      a.click()
      
      // Track export
      await supabase.from('exports').insert({
        user_id: user?.id,
        export_type: format
      })
      
      setCompleted([...completed, format])
      
      // Update last export date
      await supabase
        .from('profiles')
        .update({ last_export_date: new Date().toISOString() })
        .eq('id', user?.id)
        
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/app" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Your Brain</h1>
          <p className="text-gray-600 mb-8">
            Your thoughts belong to you. Download everything in your preferred format.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <p className="text-blue-700">
              <strong>{thoughts.length} thoughts</strong> ready to export • 
              Last export: {completed.length > 0 ? 'Just now' : 'Never'}
            </p>
          </div>
          
          <div className="grid gap-4">
            {exportFormats.map((format) => {
              const isExporting = exporting === format.id
              const isCompleted = completed.includes(format.id)
              
              return (
                <motion.button
                  key={format.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => exportData(format.id)}
                  disabled={isExporting || loading}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      isCompleted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <format.icon className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {format.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {isExporting ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <h2 className="font-semibold text-gray-900 mb-2">About Your Data</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• All exports include your complete thought history</li>
              <li>• Generated content is included where available</li>
              <li>• Exports are generated locally - we don&apos;t store copies</li>
              <li>• You can export as many times as you want</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}