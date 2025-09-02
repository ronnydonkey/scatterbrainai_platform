import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  VoiceDiscoveryAnalyzer, 
  VoiceDiscoveryResponse,
  voiceDiscoveryQuestions 
} from '@/lib/onboarding/voice-discovery';

export async function GET(request: NextRequest) {
  try {
    // Return the voice discovery questions
    return NextResponse.json({
      questions: voiceDiscoveryQuestions,
      totalQuestions: voiceDiscoveryQuestions.length
    });
  } catch (error) {
    console.error('Error fetching voice discovery questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

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
    const { responses }: { responses: VoiceDiscoveryResponse[] } = await request.json();
    
    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid responses format' },
        { status: 400 }
      );
    }

    // Analyze responses to determine archetype
    const analyzer = new VoiceDiscoveryAnalyzer();
    const archetypeResult = analyzer.analyzeResponses(responses);
    
    // Generate voice profile from analysis
    const voiceProfile = analyzer.generateVoiceProfile(archetypeResult, responses);
    
    // Check if user already has a voice profile
    const { data: existingProfile } = await supabase
      .from('voice_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let profileResult;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('voice_profiles')
        .update({
          ...voiceProfile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating voice profile:', error);
        return NextResponse.json(
          { error: 'Failed to update voice profile' },
          { status: 500 }
        );
      }
      
      profileResult = data;
      
      // Record the change in learning history
      await supabase
        .from('voice_learning_history')
        .insert({
          user_id: user.id,
          change_type: 'archetype_change',
          old_value: { archetype: existingProfile },
          new_value: { archetype: archetypeResult.primary },
          trigger_source: 'user_onboarding'
        });
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('voice_profiles')
        .insert({
          ...voiceProfile,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating voice profile:', error);
        return NextResponse.json(
          { error: 'Failed to create voice profile' },
          { status: 500 }
        );
      }
      
      profileResult = data;
    }

    // Return the analysis result and created/updated profile
    return NextResponse.json({
      archetype: archetypeResult,
      profile: profileResult,
      message: 'Voice profile successfully created'
    });

  } catch (error) {
    console.error('Error in voice discovery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}