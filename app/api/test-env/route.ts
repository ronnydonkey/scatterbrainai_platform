import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Only show in development or with proper auth
  const isDev = process.env.NODE_ENV === 'development'
  
  return NextResponse.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    checks: {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasClaudeKey: !!process.env.CLAUDE_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    // Only show partial keys in dev
    keys: isDev ? {
      anthropic: process.env.ANTHROPIC_API_KEY?.slice(0, 10) + '...',
      claude: process.env.CLAUDE_API_KEY?.slice(0, 10) + '...',
      supabaseService: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + '...'
    } : 'hidden'
  })
}