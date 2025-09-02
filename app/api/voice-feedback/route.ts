import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VoiceAwareContentEngine } from '@/lib/content-engine/voice-aware-content-engine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const feedback = await request.json();
    
    // Validate required fields
    if (!feedback.contentId || !feedback.rating || !feedback.feedbackType) {
      return NextResponse.json(
        { error: 'Missing required feedback fields' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (feedback.rating < 1 || feedback.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    console.log(`📊 Processing voice feedback for user ${user.id}`);

    // Process the feedback using voice engine
    const voiceEngine = new VoiceAwareContentEngine();
    await voiceEngine.processVoiceFeedback(
      user.id,
      feedback.contentId,
      {
        rating: feedback.rating,
        feedbackType: feedback.feedbackType,
        specificFeedback: feedback.specificFeedback,
        phrasesToAdd: feedback.phrasesToAdd,
        phrasesToRemove: feedback.phrasesToRemove,
        toneAdjustment: feedback.toneAdjustment
      }
    );

    // Fetch updated voice profile to return
    const { data: updatedProfile } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      message: 'Feedback processed successfully',
      updatedProfile: updatedProfile
    });

  } catch (error) {
    console.error('Error processing voice feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve feedback history
export async function GET(request: NextRequest) {
  try {
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch feedback history
    const { data: feedbackHistory, error: fetchError } = await supabase
      .from('content_feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error('Error fetching feedback history:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch feedback history' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('content_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      feedback: feedbackHistory || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching feedback history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback history' },
      { status: 500 }
    );
  }
}