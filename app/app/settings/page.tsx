'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, AlertTriangle, ArrowLeft, Shield, Brain, Download } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePhrase, setDeletePhrase] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDeleteAccount = async () => {
    if (deletePhrase !== 'delete my brain') {
      setError('Please type the exact phrase to confirm')
      return
    }

    setDeleting(true)
    setError('')

    try {
      // Delete all user thoughts first
      await supabase
        .from('thoughts')
        .delete()
        .eq('user_id', user?.id)

      // Delete user profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id)

      // Try to delete the user account via custom function
      const { error: deleteError } = await supabase.rpc('delete_user')
      
      if (deleteError) {
        console.error('Delete user error:', deleteError)
        // Even if the auth deletion fails, we've deleted the data
        // so we can still sign out
      }

      // Sign out and redirect
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      setError('Failed to delete account. Please try again.')
      setDeleting(false)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
          
          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              Account Information
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">User ID:</span> {user?.id}
              </p>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Data Management
            </h2>
            <div className="space-y-4">
              <Link
                href="/app/export"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">Export Your Data</h3>
                  <p className="text-sm text-gray-600">Download all your thoughts in various formats</p>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Danger Zone
            </h2>
            
            {!showDeleteConfirm ? (
              <div>
                <p className="text-red-700 mb-4">
                  Once you delete your account, there is no going back. All your thoughts, 
                  analyses, and generated content will be permanently removed.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete My Account</span>
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div className="bg-white border border-red-300 rounded-lg p-4">
                  <p className="text-red-900 font-medium mb-2">
                    This action cannot be undone. To confirm, type: <span className="font-mono bg-red-100 px-2 py-1 rounded">delete my brain</span>
                  </p>
                  <input
                    type="text"
                    value={deletePhrase}
                    onChange={(e) => setDeletePhrase(e.target.value)}
                    placeholder="Type the phrase here"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {error && (
                    <p className="text-red-600 text-sm mt-2">{error}</p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deletePhrase !== 'delete my brain'}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>{deleting ? 'Deleting...' : 'Delete Everything'}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeletePhrase('')
                      setError('')
                    }}
                    disabled={deleting}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}