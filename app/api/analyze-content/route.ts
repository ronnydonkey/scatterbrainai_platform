import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { EnhancedContentEngine } from '@/lib/content-engine/enhanced-content-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null

export async function POST(request: NextRequest) {
  try {
    const { content, sourceType, userProfile, brainId } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the token and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Use enhanced content engine if API key available
    if (anthropicApiKey) {
      try {
        const engine = new EnhancedContentEngine()
        
        // Use provided profile or default
        const profile = userProfile || {
          voice: 'insightful and engaging',
          expertise: ['technology', 'innovation', 'research'],
          preferences: {
            tone: 'professional yet accessible',
            sophistication: 'professional' as const,
            includeExploration: true
          }
        }
        
        const enhancedResult = await engine.generatePremiumContent(content, profile)
        
        const analysisData = {
          analysis: enhancedResult.researchContext.domain + ': ' + enhancedResult.researchContext.keyDimensions.join(', '),
          research_suggestions: enhancedResult.explorationPaths.practicalApplications.concat(
            enhancedResult.explorationPaths.relatedTopics
          ),
          key_themes: enhancedResult.researchContext.keyDimensions,
          connections: enhancedResult.researchContext.crossDisciplinaryConnections,
          content_suggestions: {
            twitter: enhancedResult.content.twitter,
            reddit: enhancedResult.content.reddit,
            linkedin: enhancedResult.content.linkedin,
            youtube: enhancedResult.content.youtube
          },
          // Additional premium data
          counterintuitive_findings: enhancedResult.researchContext.counterintuitiveFindings,
          expert_perspectives: enhancedResult.researchContext.expertPerspectives,
          authority_figures: enhancedResult.researchContext.authorityFigures,
          exploration_paths: enhancedResult.explorationPaths
        }

        // Create thought in database
        console.log('Creating thought for user:', user.id)
        const thoughtData = {
          user_id: user.id,
          title: enhancedResult.researchContext.keyDimensions[0] || 'New Thought',
          content: content.slice(0, 500),
          source_type: sourceType || 'text',
          source_data: content,
          analysis: analysisData,
          generated_content: analysisData.content_suggestions,
          tags: enhancedResult.researchContext.keyDimensions
        }
        console.log('Thought data:', JSON.stringify(thoughtData, null, 2))
        
        const { data: thought, error: thoughtError } = await supabase
          .from('thoughts')
          .insert(thoughtData)
          .select()
          .single()

        if (thoughtError) {
          console.error('Error creating thought:', thoughtError)
          return NextResponse.json({ 
            error: `Failed to save thought: ${thoughtError.message || 'Unknown error'}`,
            details: thoughtError
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          thoughtId: thought.id,
          analysis: analysisData
        })
      } catch (error) {
        console.error('Enhanced content engine error:', error)
        // Fall back to basic Claude analysis
        const analysis = await analyzeWithClaude(content, sourceType)
        const analysisData = {
          analysis: analysis.summary,
          research_suggestions: analysis.insights,
          key_themes: analysis.tags,
          connections: analysis.connections,
          content_suggestions: analysis.content_suggestions || {
            twitter: `🧠 ${content.slice(0, 100)}... \n\n#${analysis.tags.join(' #')}`,
            reddit: `Just had this thought: ${content.slice(0, 200)}...\n\nWhat do you all think?`,
            linkedin: `Insights on ${analysis.tags.join(' and ')}: ${content.slice(0, 150)}...`,
            youtube: `Today we're discussing: ${content.slice(0, 100)}...`
          }
        }

        // Create thought in database
        const { data: thought, error: thoughtError } = await supabase
          .from('thoughts')
          .insert({
            user_id: user.id,
            title: analysis.tags[0] || 'New Thought',
            content: content.slice(0, 500),
            source_type: sourceType || 'text',
            source_data: content,
            analysis: analysisData,
            generated_content: analysisData.content_suggestions,
            tags: analysis.tags
          })
          .select()
          .single()

        if (thoughtError) {
          console.error('Error creating thought:', thoughtError)
          return NextResponse.json({ 
            error: `Failed to save thought: ${thoughtError.message || 'Unknown error'}`,
            details: thoughtError
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          thoughtId: thought.id,
          analysis: analysisData
        })
      }
    } else {
      // No API key configured
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in analyze-content API:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}


async function analyzeWithClaude(content: string, sourceType: string) {
  if (!anthropic) {
    throw new Error('Claude API not configured')
  }

  const prompt = `You are an expert content strategist and researcher. Analyze this ${sourceType === 'url' ? 'article/web content' : 'thought/idea'} with exceptional depth and insight.

Content to analyze:
${content}

Provide a comprehensive analysis that includes:

1. **Executive Summary**: Write a detailed, insightful summary that captures the essence, nuance, and implications of this content. Go beyond surface-level observations to identify underlying patterns, assumptions, and potential impacts.

2. **Key Themes & Concepts**: Identify 3-5 core themes, using specific, descriptive tags that would be valuable for knowledge management and future reference.

3. **Intellectual Connections**: Draw sophisticated connections to:
   - Related academic fields or disciplines
   - Current trends and emerging patterns
   - Historical precedents or parallels
   - Potential future implications
   - Cross-domain applications

4. **Research Opportunities**: Suggest 3-5 specific, actionable research directions that would deepen understanding, including:
   - Key questions to explore
   - Experts or thought leaders to follow
   - Specific papers, books, or resources to consult
   - Experiments or investigations to conduct

5. **Platform-Optimized Content**: Create compelling, high-value content for each platform:
   
   **Twitter/X**: Craft a thought-provoking thread (2-3 tweets) that:
   - Opens with a compelling hook
   - Provides genuine insight or a fresh perspective
   - Includes relevant hashtags and a call-to-action
   
   **Reddit**: Write an engaging discussion starter that:
   - Poses thoughtful questions to the community
   - Shares unique insights or experiences
   - Invites meaningful dialogue
   - Fits the culture of relevant subreddits
   
   **LinkedIn**: Compose a professional thought leadership post that:
   - Demonstrates expertise and insight
   - Provides actionable value to professionals
   - Includes a compelling narrative or case study
   - Ends with a thoughtful question or call-to-action
   
   **YouTube**: Outline a compelling video script structure:
   - Attention-grabbing intro (first 15 seconds)
   - 3-5 key points with supporting evidence
   - Engaging examples or demonstrations
   - Strong conclusion with next steps

Return your analysis in this JSON format:
{
  "summary": "comprehensive executive summary with deep insights",
  "tags": ["specific_concept_1", "domain_area_2", "methodology_3", "application_4", "trend_5"],
  "connections": [
    "Sophisticated connection to related field with explanation",
    "Link to emerging trend with specific examples",
    "Historical parallel with lessons learned",
    "Cross-domain application with potential impact"
  ],
  "insights": [
    "Specific research direction with methodology",
    "Key question to explore with hypothesis",
    "Resource recommendation with rationale",
    "Expert or community to engage with purpose",
    "Experiment or investigation to conduct"
  ],
  "content_suggestions": {
    "x_twitter": "Thread with multiple tweets, hooks, insights, and hashtags",
    "reddit": "Engaging discussion starter with questions and unique perspective",
    "linkedin": "Professional thought leadership post with narrative and value",
    "youtube_script": "Detailed video outline with timestamps and key points"
  }
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      temperature: 0.8,
      system: "You are an elite content strategist and researcher who produces exceptionally high-quality, nuanced analysis. Your insights should be specific, actionable, and demonstrate deep understanding. Avoid generic observations and surface-level analysis.",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Extract JSON from Claude's response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const analysis = JSON.parse(jsonMatch[0])
        return {
          summary: analysis.summary || 'No summary provided',
          tags: analysis.tags || [],
          connections: analysis.connections || [],
          insights: analysis.insights || [],
          content_suggestions: analysis.content_suggestions || {
            x_twitter: '',
            reddit: '',
            linkedin: '',
            youtube_script: ''
          }
        }
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError)
        // Fall back to text-based response
        return {
          summary: responseText,
          tags: ['AI Analysis'],
          connections: ['Analyzed by Claude'],
          insights: ['See summary for details']
        }
      }
    }

    // If no JSON found, return the text as summary
    return {
      summary: responseText,
      tags: ['AI Analysis'],
      connections: ['Analyzed by Claude'],
      insights: ['See summary for details']
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to analyze with Claude')
  }
}