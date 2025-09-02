import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VoiceAwareContentEngine } from '@/lib/content-engine/voice-aware-content-engine';
import { EnhancedContentEngine } from '@/lib/content-engine/enhanced-content-service';

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
    const { content, brainId } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`📝 Analyzing content for user ${user.id} with voice awareness`);

    // Check if user has completed voice onboarding
    const { data: voiceProfile } = await supabase
      .from('voice_profiles')
      .select('id, archetype')
      .eq('user_id', user.id)
      .single();

    let result;
    let thoughtData;

    if (voiceProfile) {
      // Use voice-aware content engine
      console.log(`🎯 Using voice-aware engine with ${voiceProfile.archetype} archetype`);
      
      try {
        const voiceEngine = new VoiceAwareContentEngine();
        const voiceResult = await voiceEngine.generateVoiceAwareContent(content, user.id);
        
        // Store the thought with voice metadata
        const { data: thought, error: thoughtError } = await supabase
          .from('thoughts')
          .insert({
            user_id: user.id,
            brain_id: brainId,
            content: content,
            analysis: {
              content: voiceResult.content,
              explorationPaths: voiceResult.explorationPaths,
              voiceMetadata: voiceResult.voiceMetadata
            },
            voice_profile_version: voiceProfile.id,
            voice_archetype: voiceProfile.archetype,
            authenticity_score: voiceResult.voiceMetadata.authenticityScore
          })
          .select()
          .single();

        if (thoughtError) {
          console.error('Error storing thought:', thoughtError);
          return NextResponse.json(
            { error: 'Failed to store analysis' },
            { status: 500 }
          );
        }

        thoughtData = thought;
        result = voiceResult;
        
      } catch (voiceError) {
        console.error('Voice-aware engine error:', voiceError);
        
        // Fallback to basic engine
        console.log('⚠️ Falling back to basic content engine');
        const basicEngine = new EnhancedContentEngine();
        const basicResult = await basicEngine.generatePremiumContent(content, {
          voice: 'default',
          expertise: [],
          preferences: {
            tone: 'conversational',
            sophistication: 'professional' as const,
            includeExploration: true
          }
        });
        
        // Store with basic result
        const { data: thought } = await supabase
          .from('thoughts')
          .insert({
            user_id: user.id,
            brain_id: brainId,
            content: content,
            analysis: basicResult
          })
          .select()
          .single();
        
        thoughtData = thought;
        result = {
          ...basicResult,
          voiceMetadata: {
            archetype: 'default',
            adaptations: ['Voice engine unavailable - using standard analysis'],
            authenticityScore: 0.5
          }
        };
      }
    } else {
      // No voice profile - use basic engine but prompt for voice discovery
      console.log('📋 No voice profile found - using basic engine');
      
      const basicEngine = new EnhancedContentEngine();
      const basicResult = await basicEngine.generatePremiumContent(content, {
        voice: 'default',
        expertise: [],
        preferences: {
          tone: 'conversational',
          sophistication: 'professional' as const,
          includeExploration: true
        }
      });
      
      // Store the thought
      const { data: thought } = await supabase
        .from('thoughts')
        .insert({
          user_id: user.id,
          brain_id: brainId,
          content: content,
          analysis: basicResult
        })
        .select()
        .single();
      
      thoughtData = thought;
      result = {
        ...basicResult,
        voiceMetadata: {
          archetype: 'none',
          adaptations: ['Complete voice discovery for personalized content'],
          authenticityScore: 0.3
        },
        needsVoiceOnboarding: true
      };
    }

    return NextResponse.json({
      success: true,
      thoughtId: thoughtData?.id,
      analysis: result
    });

  } catch (error) {
    console.error('Error in voice-aware content analysis:', error);
    
    // Last resort fallback
    const basicEngine = new EnhancedContentEngine();
    try {
      const fallbackResult = await basicEngine.generatePremiumContent('Unable to process - please try again', {
        voice: 'default',
        expertise: [],
        preferences: {
          tone: 'conversational',
          sophistication: 'professional' as const,
          includeExploration: true
        }
      });
      return NextResponse.json({
        success: false,
        analysis: fallbackResult,
        error: 'Analysis service temporarily unavailable'
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }
  }
}