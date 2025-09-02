import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // For now, we'll use a mock Claude API response
    // In production, you would call the actual Claude API here
    const analysis = generateMockAnalysis(content, sourceType)

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