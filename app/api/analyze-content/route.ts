import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { EnhancedContentEngine } from '@/lib/content-engine/enhanced-content-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null

// Set timeout for API processing (30 seconds)
const API_TIMEOUT = 30000;

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const { content, sourceType, userProfile, brainId } = await request.json()

    if (!content) {
      clearTimeout(timeoutId);
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
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

        clearTimeout(timeoutId);
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
            twitter: `1/ 🧠 New insight on ${analysis.tags[0]}: ${content.slice(0, 200)}...\n\n2/ This connects to broader patterns in ${analysis.tags.join(', ')}.\n\n3/ What are your thoughts on this? Let's discuss below 👇\n\n#${analysis.tags.join(' #')}`,
            reddit: `Just discovered something fascinating about ${analysis.tags[0]}\n\n${content.slice(0, 400)}...\n\nThis got me thinking about the broader implications. What's your take on this? Have you noticed similar patterns?\n\nWould love to hear different perspectives from the community.`,
            linkedin: `Exploring the intersection of ${analysis.tags.join(' and ')}:\n\n${content.slice(0, 300)}...\n\nThis insight has significant implications for how we approach our work. What resonates with you?\n\n#${analysis.tags.join(' #')}`,
            youtube: `Title: "Understanding ${analysis.tags[0]}: Key Insights and Analysis"\n\nDescription: In this video, we explore ${content.slice(0, 200)}... Join us for a deep dive into ${analysis.tags.join(', ')} and their practical applications.`
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

        clearTimeout(timeoutId);
        return NextResponse.json({
          success: true,
          thoughtId: thought.id,
          analysis: analysisData
        })
      }
    } else {
      // No API key configured
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 500 }
      )
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error in analyze-content API:', error)
    
    // Check if it was a timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again with shorter content.' },
        { status: 504 }
      )
    }
    
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

CRITICAL: Analyze the ACTUAL CONTENT below. Do not default to generic topics:
- If it's about recovery/addiction, analyze recovery themes
- If it's about creativity/creative blocks, analyze creativity themes  
- If it's about mental health, analyze mental health themes
- If it's about personal growth, analyze personal growth themes
- Extract and analyze the REAL subject matter

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
   
   **Twitter/X Thread** (5-8 tweets): Create a FULL THREAD with proper flow:
   1/ Hook tweet with counterintuitive insight or surprising fact
   2/ Context and evidence that builds on the hook
   3/ Key research finding or expert perspective
   4/ Real-world example or case study
   5/ Another crucial insight or implication
   6/ What this means practically
   7/ Future implications or trends
   8/ Summary with 3-4 relevant hashtags
   
   **LinkedIn Post** (250-300 words): Professional thought leadership:
   - Compelling opening line
   - Personal anecdote or observation
   - 3-4 key insights with specific examples
   - Business implications clearly explained
   - Actionable takeaways
   - Engagement question
   - Professional hashtags
   
   **Reddit Post** (350-500 words): Community discussion starter:
   - Intriguing title
   - Context paragraph
   - Main insight with detailed explanation
   - 3-4 supporting points with evidence
   - Acknowledge potential counterarguments
   - Multiple discussion questions
   - TL;DR summary
   
   **YouTube Script**: Complete video outline:
   - SEO-optimized title
   - 100+ word description with timestamps
   - Hook script (15-30 seconds)
   - 3-5 main sections with talking points
   - Specific examples and demonstrations
   - Call-to-action conclusion

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
    "x_twitter": "Full Twitter thread with 5-8 numbered tweets, each with compelling content",
    "reddit": "Complete 350-500 word discussion post with title, body, questions, and TL;DR",
    "linkedin": "Professional 250-300 word post with insights, examples, and engagement hook",
    "youtube_script": "Full video outline: title, 100+ word description, hook script, main points, CTA"
  }
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 6000,
      temperature: 0.8,
      system: "You are an elite content strategist and researcher. CRITICAL: Analyze the EXACT content provided - if it's about recovery, analyze recovery themes; if about creativity, analyze creativity; if about mental health, analyze those themes. NEVER default to generic productivity topics unless that's what the content is actually about. Your insights should be specific to the actual subject matter.",
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