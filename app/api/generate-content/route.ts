import { NextRequest, NextResponse } from 'next/server';
import { handleEnhancedContentGeneration } from '@/lib/content-engine/api-route-handler';

export async function POST(request: NextRequest) {
  try {
    const { topic, userProfile } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Use default profile if not provided
    const profile = userProfile || {
      voice: 'conversational yet sophisticated',
      expertise: ['general knowledge'],
      preferences: {
        tone: 'professional',
        sophistication: 'professional' as const,
        includeExploration: true
      }
    };

    // Enhanced generation with research phase
    const result = await handleEnhancedContentGeneration(topic, profile);
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      // Return error with fallback indication
      return NextResponse.json({ 
        error: result.error, 
        fallback: true 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Generate content API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}