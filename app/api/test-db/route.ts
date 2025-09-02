import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Check if we have the service key
    if (!supabaseServiceKey || supabaseServiceKey === 'undefined') {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY not found in environment',
        hasKey: false
      }, { status: 500 })
    }

    // Create supabase client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test database connection by checking thoughts table structure
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .limit(0)

    if (error) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: error,
        hasKey: true
      }, { status: 500 })
    }

    // Try to get a sample thought to see the structure
    const { data: sampleThought, error: sampleError } = await supabase
      .from('thoughts')
      .select('*')
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      hasServiceKey: true,
      tableExists: true,
      sampleStructure: sampleThought ? Object.keys(sampleThought) : 'No existing thoughts found',
      keyLength: supabaseServiceKey.length
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}