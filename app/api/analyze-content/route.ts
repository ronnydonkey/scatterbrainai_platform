import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const anthropicApiKey = process.env.ANTHROPIC_API_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null

export async function POST(request: NextRequest) {
  try {
    const { content, sourceType } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Get the user from the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use Claude API if available, otherwise fall back to mock
    const analysis = anthropic 
      ? await analyzeWithClaude(content, sourceType)
      : generateMockAnalysis(content, sourceType)

    return NextResponse.json({
      analysis: analysis.summary,
      research_suggestions: analysis.insights,
      key_themes: analysis.tags,
      connections: analysis.connections,
      content_suggestions: {
        x_twitter: `🧠 ${content.slice(0, 100)}... \n\n#${analysis.tags.join(' #')}`,
        reddit: `Just had this thought: ${content.slice(0, 200)}...\n\nWhat do you all think?`,
        linkedin: `Insights on ${analysis.tags.join(' and ')}: ${content.slice(0, 150)}...`,
        youtube_script: `Today we're discussing: ${content.slice(0, 100)}...`
      }
    })
  } catch (error) {
    console.error('Error in analyze-content API:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}

function generateMockAnalysis(content: string, sourceType: string) {
  // This is a mock function that simulates Claude's analysis
  const words = content.toLowerCase().split(' ')
  
  const topics = []
  if (words.some(w => ['ai', 'machine', 'learning', 'artificial', 'intelligence'].includes(w))) {
    topics.push('AI/ML')
  }
  if (words.some(w => ['business', 'startup', 'company', 'product'].includes(w))) {
    topics.push('Business')
  }
  if (words.some(w => ['design', 'user', 'experience', 'interface'].includes(w))) {
    topics.push('Design')
  }
  if (topics.length === 0) {
    topics.push('General')
  }

  return {
    summary: `This ${sourceType === 'url' ? 'article' : 'thought'} discusses ${topics.join(' and ')} concepts. The content provides insights into ${content.slice(0, 50)}...`,
    tags: topics,
    connections: [
      `Related to ${topics[0]} trends`,
      'Could be expanded into a blog post',
      'Contains actionable insights'
    ],
    insights: [
      'Key takeaway: ' + content.slice(0, 100) + '...',
      'Consider exploring this topic further',
      'This could be valuable for your audience'
    ]
  }
}

async function analyzeWithClaude(content: string, sourceType: string) {
  if (!anthropic) {
    throw new Error('Claude API not configured')
  }

  const prompt = `Analyze this ${sourceType === 'url' ? 'article/web content' : 'thought/idea'} and provide:
1. A comprehensive summary
2. Key themes and topics (return as an array)
3. Potential connections to other ideas
4. Research suggestions for deeper exploration
5. Content suggestions for social media platforms (Twitter/X, Reddit, LinkedIn, YouTube)

Content to analyze:
${content}

Return your analysis in this JSON format:
{
  "summary": "detailed summary here",
  "tags": ["tag1", "tag2", "tag3"],
  "connections": ["connection1", "connection2"],
  "insights": ["insight1", "insight2", "insight3"],
  "content_suggestions": {
    "x_twitter": "tweet content",
    "reddit": "reddit post",
    "linkedin": "linkedin post",
    "youtube_script": "youtube script outline"
  }
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.7,
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