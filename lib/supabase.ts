import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl || 'NOT SET')
  console.log('Has Supabase Key:', !!supabaseAnonKey)
}

// Create a dummy client for when env vars are not set
const dummyClient = {
  auth: {
    signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: new Error('Supabase not configured') }),
    getSession: async () => ({ data: null, error: new Error('Supabase not configured') }),
    onAuthStateChange: () => ({ data: null, unsubscribe: () => {} }),
  },
  from: () => ({
    select: () => ({ data: null, error: new Error('Supabase not configured') }),
    insert: () => ({ data: null, error: new Error('Supabase not configured') }),
    update: () => ({ eq: () => ({ data: null, error: new Error('Supabase not configured') }) }),
    delete: () => ({ eq: () => ({ data: null, error: new Error('Supabase not configured') }) }),
  }),
} as any

// Export the appropriate client
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? dummyClient
  : createClient(supabaseUrl, supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          writing_style: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          writing_style?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          writing_style?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      thoughts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          source_type: 'text' | 'url'
          source_data: string
          analysis: string | null
          research_data: string | null
          generated_content: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          source_type: 'text' | 'url'
          source_data: string
          analysis?: string | null
          research_data?: string | null
          generated_content?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          source_type?: 'text' | 'url'
          source_data?: string
          analysis?: string | null
          research_data?: string | null
          generated_content?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          user_id: string
          thought_id_1: string
          thought_id_2: string
          connection_type: string
          strength: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thought_id_1: string
          thought_id_2: string
          connection_type: string
          strength: number
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thought_id_1?: string
          thought_id_2?: string
          connection_type?: string
          strength?: number
          description?: string
          created_at?: string
        }
      }
    }
  }
}