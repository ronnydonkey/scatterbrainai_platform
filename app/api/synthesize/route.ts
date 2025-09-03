import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import ScatterbrainAgents from '../../lib/agents/scatterbrainAgents'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { input, sourceType = 'text' } = await request.json()

    if (!input) {
      return new Response(
        JSON.stringify({ error: 'Input is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create a TransformStream for Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial acknowledgment
          controller.enqueue(encoder.encode('data: {"status": "initialized", "message": "Starting 3-agent synthesis..."}\n\n'))

          // Initialize agents
          const agents = new ScatterbrainAgents(anthropicApiKey)
          
          // Agent 1: Research
          controller.enqueue(encoder.encode('data: {"stage": "research", "status": "processing", "message": "Extracting key information..."}\n\n'))
          const researchStart = Date.now()
          const research = await agents.researchAgent(input)
          const researchTime = Date.now() - researchStart
          controller.enqueue(encoder.encode(`data: {"stage": "research", "status": "complete", "time": ${researchTime}, "preview": {"topics": ${JSON.stringify(research.topics?.slice(0, 3))}, "themes": ${JSON.stringify(research.themes?.slice(0, 3))}}}\n\n`))

          // Agent 2: Analysis
          controller.enqueue(encoder.encode('data: {"stage": "analysis", "status": "processing", "message": "Finding patterns and insights..."}\n\n'))
          const analysisStart = Date.now()
          const analysis = await agents.analysisAgent(research)
          const analysisTime = Date.now() - analysisStart
          controller.enqueue(encoder.encode(`data: {"stage": "analysis", "status": "complete", "time": ${analysisTime}, "preview": {"patterns": ${analysis.patterns?.length || 0}, "insights": ${analysis.insights?.length || 0}}}\n\n`))

          // Agent 3: Content
          controller.enqueue(encoder.encode('data: {"stage": "content", "status": "processing", "message": "Creating beautiful presentation..."}\n\n'))
          const contentStart = Date.now()
          const content = await agents.contentAgent(analysis, input)
          const contentTime = Date.now() - contentStart
          controller.enqueue(encoder.encode(`data: {"stage": "content", "status": "complete", "time": ${contentTime}}\n\n`))

          // Format final output
          const formattedOutput = agents.getFormattedOutput({
            success: true,
            research,
            analysis,
            content,
            timing: {
              research: researchTime,
              analysis: analysisTime,
              content: contentTime,
              total: researchTime + analysisTime + contentTime
            }
          })

          // Save to database
          controller.enqueue(encoder.encode('data: {"stage": "saving", "status": "processing", "message": "Saving your insight..."}\n\n'))
          
          const thoughtData = {
            user_id: user.id,
            title: formattedOutput.summary.headline || 'New Insight',
            content: input.slice(0, 500),
            source_type: sourceType,
            source_data: input,
            analysis: {
              analysis: formattedOutput.summary.overview,
              research_suggestions: formattedOutput.metadata.patterns?.map((p: any) => p.pattern) || [],
              key_themes: formattedOutput.metadata.themes || [],
              connections: formattedOutput.metadata.patterns?.map((p: any) => p.evidence.join(' → ')) || [],
              insights: formattedOutput.insights,
              action_items: formattedOutput.actions,
              visual_elements: formattedOutput.visual
            },
            generated_content: {
              twitter: formattedOutput.insights?.[0]?.description || 'Key insight from your thought',
              reddit: formattedOutput.insights?.map((i: any) => i.description).join('\n\n') || 'Discussion starter',
              linkedin: formattedOutput.summary.headline + '\n\n' + formattedOutput.summary.overview,
              youtube: {
                title: formattedOutput.summary.headline,
                description: formattedOutput.summary.overview,
                main_points: formattedOutput.highlights || []
              }
            },
            tags: formattedOutput.metadata.topics || []
          }
          
          const { data: thought, error: thoughtError } = await supabase
            .from('thoughts')
            .insert(thoughtData)
            .select()
            .single()

          if (thoughtError) {
            throw new Error(`Failed to save: ${thoughtError.message}`)
          }

          // Send final result
          controller.enqueue(encoder.encode(`data: {"stage": "complete", "status": "success", "thoughtId": "${thought.id}", "result": ${JSON.stringify(formattedOutput)}}\n\n`))
          
          // Close the stream
          controller.close()
        } catch (error) {
          // Send error event
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          controller.enqueue(encoder.encode(`data: {"stage": "error", "status": "failed", "error": "${errorMessage}"}\n\n`))
          controller.close()
        }
      }
    })

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Synthesize API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}