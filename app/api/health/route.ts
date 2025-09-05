import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check which environment variables are set (without exposing their values)
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnthropicKey: !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  // Test basic functionality
  try {
    // Check if we can create Anthropic client
    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Anthropic API key not configured',
        env: envCheck
      }, { status: 500 });
    }

    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase configuration incomplete',
        env: envCheck
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'All required environment variables are configured',
      env: envCheck
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      env: envCheck
    }, { status: 500 });
  }
}