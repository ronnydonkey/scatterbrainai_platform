import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import PowerfulSingleAgent from '../../lib/agents/powerfulSingleAgent'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

// Create service client for database operations
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
// Create anon client for auth verification
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)

// Set timeout for API processing (45 seconds for 3 agents)
const API_TIMEOUT = 45000;

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  console.log('analyze-content-v2: Starting request');
  console.log('Environment check:', {
    hasAnthropicKey: !!anthropicApiKey,
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseServiceKey
  });
  
  try {
    const { content, sourceType, userProfile, brainId, synthesisResults } = await request.json()

    if (!content) {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!anthropicApiKey) {
      clearTimeout(timeoutId);
      console.error('Missing Anthropic API key');
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }

    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    
    if (authError || !user) {
      clearTimeout(timeoutId);
      console.error('Auth verification failed:', authError?.message || 'No user found');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Use the powerful single agent
    console.log('Creating PowerfulSingleAgent...');
    let agent;
    try {
      agent = new PowerfulSingleAgent(anthropicApiKey);
    } catch (agentError) {
      console.error('Failed to create agent:', agentError);
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Failed to initialize AI agent', details: agentError instanceof Error ? agentError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    console.log('Starting analysis for user:', user.id);
    
    let analysisResult;
    try {
      analysisResult = await agent.analyze(content);
      console.log('Analysis completed successfully');
    } catch (analysisError) {
      console.error('Analysis failed:', analysisError);
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Analysis failed', details: analysisError instanceof Error ? analysisError.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    if (!analysisResult) {
      console.error('Analysis failed');
      clearTimeout(timeoutId);
      return NextResponse.json(
        { 
          error: 'Analysis failed', 
          details: 'Unable to process content'
        },
        { status: 500 }
      );
    }

    // Prepare data for database
    const analysisData = {
      // Core analysis
      analysis: analysisResult.summary.overview,
      research_suggestions: analysisResult.connections || [],
      key_themes: analysisResult.themes || [],
      connections: analysisResult.connections || [],
      
      // Platform-optimized content
      content_suggestions: analysisResult.platform_content,
      
      // Enhanced metadata
      insights: analysisResult.insights,
      action_items: analysisResult.action_items,
      key_insight: analysisResult.summary.key_insight,
      processing_time: analysisResult.metadata.processing_time
    }

    // Create thought in database
    console.log('Saving thought to database...');
    const thoughtData = {
      user_id: user.id,
      title: analysisResult.summary.headline || 'New Insight',
      content: content.slice(0, 500),
      source_type: sourceType || 'text',
      source_data: content,
      analysis: analysisData,
      generated_content: analysisData.content_suggestions,
      tags: analysisResult.themes || []
    }
    
    const { data: thought, error: thoughtError } = await supabaseService
      .from('thoughts')
      .insert(thoughtData)
      .select()
      .single()

    if (thoughtError) {
      console.error('Error creating thought:', thoughtError)
      clearTimeout(timeoutId);
      return NextResponse.json({ 
        error: `Failed to save thought: ${thoughtError.message || 'Unknown error'}`,
        details: thoughtError
      }, { status: 500 })
    }

    clearTimeout(timeoutId);
    
    // Return success with enhanced analysis
    return NextResponse.json({
      success: true,
      thoughtId: thought.id,
      analysis: analysisData,
      summary: analysisResult.summary,
      insights: analysisResult.insights,
      actions: analysisResult.action_items,
      themes: analysisResult.themes,
      timing: { total: analysisResult.metadata.processing_time }
    })

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error in analyze-content-v2 API:', error)
    
    // Check if it was a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. The 3-agent pipeline may need optimization for this content length.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}