import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import ScatterbrainAgents from '../../lib/agents/scatterbrainAgents'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Set timeout for API processing (45 seconds for 3 agents)
const API_TIMEOUT = 45000;

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const { content, sourceType, userProfile, brainId, synthesisResults } = await request.json()

    if (!content) {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (!anthropicApiKey) {
      clearTimeout(timeoutId);
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    let formattedOutput;
    
    // If synthesis results are provided, use them directly
    if (synthesisResults) {
      console.log('Using provided synthesis results for user:', user.id);
      formattedOutput = synthesisResults;
    } else {
      // Otherwise run the pipeline
      const agents = new ScatterbrainAgents(anthropicApiKey);
      console.log('Starting 3-agent pipeline for user:', user.id);
      const pipelineResults = await agents.processPipeline(content);
      formattedOutput = agents.getFormattedOutput(pipelineResults);
    }
    
    if (!formattedOutput.success) {
      console.error('Pipeline failed:', formattedOutput.message);
      clearTimeout(timeoutId);
      return NextResponse.json(
        { 
          error: 'Analysis failed', 
          details: formattedOutput.message,
          partial: formattedOutput.partial 
        },
        { status: 500 }
      );
    }

    // Prepare data for database
    const analysisData = {
      // Core analysis
      analysis: formattedOutput.summary.overview,
      research_suggestions: formattedOutput.metadata.patterns?.map((p: any) => p.pattern) || [],
      key_themes: formattedOutput.metadata.themes || [],
      connections: formattedOutput.metadata.patterns?.map((p: any) => p.evidence.join(' → ')) || [],
      
      // Content suggestions for social platforms
      content_suggestions: {
        twitter: formattedOutput.insights?.[0]?.description || 'Key insight from your thought',
        reddit: formattedOutput.insights?.map((i: any) => i.description).join('\n\n') || 'Discussion starter based on your insights',
        linkedin: formattedOutput.summary.headline + '\n\n' + formattedOutput.summary.overview,
        youtube: {
          title: formattedOutput.summary.headline,
          description: formattedOutput.summary.overview,
          main_points: formattedOutput.highlights || []
        }
      },
      
      // Enhanced metadata from pipeline
      insights: formattedOutput.insights,
      action_items: formattedOutput.actions,
      visual_elements: formattedOutput.visual,
      pipeline_timing: formattedOutput.metadata.timing
    }

    // Create thought in database
    console.log('Saving thought to database...');
    const thoughtData = {
      user_id: user.id,
      title: formattedOutput.summary.headline || 'New Insight',
      content: content.slice(0, 500),
      source_type: sourceType || 'text',
      source_data: content,
      analysis: analysisData,
      generated_content: analysisData.content_suggestions,
      tags: formattedOutput.metadata.topics || []
    }
    
    const { data: thought, error: thoughtError } = await supabase
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
      summary: formattedOutput.summary,
      insights: formattedOutput.insights,
      actions: formattedOutput.actions,
      highlights: formattedOutput.highlights,
      timing: formattedOutput.metadata.timing
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