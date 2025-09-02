import { EnhancedContentEngine } from './enhanced-content-service';
import { createClient } from '@supabase/supabase-js';
import { VoiceProfile } from '../onboarding/voice-discovery';

interface VoiceAwareContent {
  content: {
    twitter: string;
    linkedin: string;
    reddit: string;
    youtube: string;
  };
  explorationPaths: {
    podcasts: string[];
    researchers: string[];
    relatedTopics: string[];
    practicalApplications: string[];
  };
  voiceMetadata: {
    archetype: string;
    adaptations: string[];
    authenticityScore: number;
  };
}

export class VoiceAwareContentEngine {
  private enhancedEngine: EnhancedContentEngine;

  constructor() {
    this.enhancedEngine = new EnhancedContentEngine();
  }

  async generateVoiceAwareContent(
    topic: string,
    userId: string
  ): Promise<VoiceAwareContent> {
    // Fetch user's voice profile
    const voiceProfile = await this.fetchVoiceProfile(userId);
    
    if (!voiceProfile) {
      // Fallback to default profile if no voice profile exists
      const defaultProfile = this.getDefaultProfile();
      const result = await this.enhancedEngine.generatePremiumContent(topic, defaultProfile);
      
      return {
        ...result,
        voiceMetadata: {
          archetype: 'explorer',
          adaptations: ['Using default voice profile'],
          authenticityScore: 0.5
        }
      };
    }

    // Convert voice profile to user profile format
    const userProfile = this.voiceProfileToUserProfile(voiceProfile);
    
    // Generate content using enhanced engine with voice-aware profile
    const enhancedResult = await this.enhancedEngine.generatePremiumContent(topic, userProfile);
    
    // Apply voice-specific refinements
    const voiceRefinedContent = await this.applyVoiceRefinements(
      enhancedResult.content,
      voiceProfile,
      topic
    );
    
    // Calculate authenticity score
    const authenticityScore = this.calculateAuthenticityScore(
      voiceRefinedContent,
      voiceProfile
    );
    
    return {
      content: voiceRefinedContent,
      explorationPaths: enhancedResult.explorationPaths,
      voiceMetadata: {
        archetype: voiceProfile.archetype,
        adaptations: this.getAppliedAdaptations(voiceProfile),
        authenticityScore
      }
    };
  }

  private async fetchVoiceProfile(userId: string): Promise<VoiceProfile | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        console.log('No voice profile found for user:', userId);
        return null;
      }
      
      return data as VoiceProfile;
    } catch (error) {
      console.error('Error fetching voice profile:', error);
      return null;
    }
  }

  private voiceProfileToUserProfile(voiceProfile: VoiceProfile) {
    // Map archetype to tone
    const archetypeToneMap: Record<string, string> = {
      explorer: 'curious and discovering',
      teacher: 'clear and educational',
      synthesizer: 'analytical and connective',
      implementer: 'practical and action-oriented'
    };

    // Map vocabulary level to sophistication
    const sophisticationMap: Record<string, 'casual' | 'professional' | 'academic'> = {
      casual: 'casual',
      professional: 'professional',
      academic: 'academic'
    };

    return {
      voice: `${voiceProfile.archetype} archetype with ${voiceProfile.engagement_style} style`,
      expertise: voiceProfile.confirmed_expertise || [],
      preferences: {
        tone: archetypeToneMap[voiceProfile.archetype] || 'conversational',
        sophistication: sophisticationMap[voiceProfile.vocabulary_level] || 'professional',
        includeExploration: true
      }
    };
  }

  private async applyVoiceRefinements(
    content: any,
    voiceProfile: VoiceProfile,
    topic: string
  ): Promise<any> {
    // Apply natural phrases
    let refinedContent = { ...content };
    
    // For each platform, refine based on voice profile
    for (const platform of ['twitter', 'linkedin', 'reddit', 'youtube']) {
      refinedContent[platform] = this.refineContentForVoice(
        content[platform],
        voiceProfile,
        platform
      );
    }
    
    return refinedContent;
  }

  private refineContentForVoice(
    content: string,
    voiceProfile: VoiceProfile,
    platform: string
  ): string {
    let refined = content;
    
    // Apply natural phrases where appropriate
    if (voiceProfile.natural_phrases && voiceProfile.natural_phrases.length > 0) {
      // For longer content (LinkedIn, Reddit), try to incorporate natural phrases
      if (platform === 'linkedin' || platform === 'reddit') {
        const randomPhrase = voiceProfile.natural_phrases[
          Math.floor(Math.random() * voiceProfile.natural_phrases.length)
        ];
        
        // Add natural phrase at the beginning if it fits
        if (!refined.toLowerCase().includes(randomPhrase.toLowerCase())) {
          refined = `${randomPhrase} ${refined}`;
        }
      }
    }
    
    // Avoid phrases the user doesn't want
    if (voiceProfile.avoided_phrases) {
      voiceProfile.avoided_phrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        refined = refined.replace(regex, '');
      });
    }
    
    // Adjust formality level
    if (voiceProfile.formality_level !== undefined) {
      refined = this.adjustFormality(refined, voiceProfile.formality_level);
    }
    
    // Apply humor level for appropriate platforms
    if (platform === 'twitter' || platform === 'reddit') {
      refined = this.adjustHumor(refined, voiceProfile.humor_level || 2);
    }
    
    return refined;
  }

  private adjustFormality(content: string, formalityLevel: number): string {
    // 0-2: Casual, 3: Neutral, 4-5: Formal
    if (formalityLevel <= 2) {
      // Make more casual
      return content
        .replace(/\bperhaps\b/gi, 'maybe')
        .replace(/\bhowever\b/gi, 'but')
        .replace(/\btherefore\b/gi, 'so')
        .replace(/\bfurthermore\b/gi, 'also');
    } else if (formalityLevel >= 4) {
      // Make more formal
      return content
        .replace(/\bmaybe\b/gi, 'perhaps')
        .replace(/\bbut\b/gi, 'however')
        .replace(/\bso\b/gi, 'therefore')
        .replace(/\balso\b/gi, 'furthermore');
    }
    
    return content;
  }

  private adjustHumor(content: string, humorLevel: number): string {
    // This is a simplified example - in production, this would be more sophisticated
    if (humorLevel >= 4) {
      // Add light humor elements if appropriate
      // This would ideally use AI to inject appropriate humor
      return content;
    }
    
    return content;
  }

  private calculateAuthenticityScore(
    content: any,
    voiceProfile: VoiceProfile
  ): number {
    let score = 0.7; // Base score
    
    // Check if natural phrases are used
    const allContent = Object.values(content).join(' ');
    let phrasesUsed = 0;
    
    if (voiceProfile.natural_phrases) {
      voiceProfile.natural_phrases.forEach(phrase => {
        if (allContent.toLowerCase().includes(phrase.toLowerCase())) {
          phrasesUsed++;
        }
      });
      
      if (phrasesUsed > 0) {
        score += 0.1 * Math.min(phrasesUsed / voiceProfile.natural_phrases.length, 0.3);
      }
    }
    
    // Check if avoided phrases are absent
    let avoidedPhrasesFound = 0;
    if (voiceProfile.avoided_phrases) {
      voiceProfile.avoided_phrases.forEach(phrase => {
        if (allContent.toLowerCase().includes(phrase.toLowerCase())) {
          avoidedPhrasesFound++;
        }
      });
      
      if (avoidedPhrasesFound > 0) {
        score -= 0.1 * avoidedPhrasesFound;
      }
    }
    
    // Bonus for high archetype confidence
    if (voiceProfile.archetype_confidence > 0.8) {
      score += 0.1;
    }
    
    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  private getAppliedAdaptations(voiceProfile: VoiceProfile): string[] {
    const adaptations: string[] = [];
    
    adaptations.push(`Using ${voiceProfile.archetype} archetype`);
    adaptations.push(`${voiceProfile.vocabulary_level} vocabulary`);
    adaptations.push(`${voiceProfile.engagement_style} engagement`);
    
    if (voiceProfile.natural_phrases && voiceProfile.natural_phrases.length > 0) {
      adaptations.push(`Incorporating ${voiceProfile.natural_phrases.length} natural phrases`);
    }
    
    if (voiceProfile.confirmed_expertise && voiceProfile.confirmed_expertise.length > 0) {
      adaptations.push(`Leveraging expertise in ${voiceProfile.confirmed_expertise.join(', ')}`);
    }
    
    return adaptations;
  }

  private getDefaultProfile() {
    return {
      voice: 'curious explorer',
      expertise: [],
      preferences: {
        tone: 'conversational and discovering',
        sophistication: 'professional' as const,
        includeExploration: true
      }
    };
  }

  // Method to update voice profile based on feedback
  async processVoiceFeedback(
    userId: string,
    contentId: string,
    feedback: {
      rating: number;
      feedbackType: string;
      specificFeedback?: string;
      phrasesToAdd?: string[];
      phrasesToRemove?: string[];
      toneAdjustment?: string;
    }
  ): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Record the feedback
      const { error: feedbackError } = await supabase
        .from('content_feedback')
        .insert({
          user_id: userId,
          content_id: contentId,
          feedback_type: feedback.feedbackType,
          rating: feedback.rating,
          specific_feedback: feedback.specificFeedback,
          phrases_to_add: feedback.phrasesToAdd,
          phrases_to_remove: feedback.phrasesToRemove,
          tone_adjustment: feedback.toneAdjustment,
          platform: 'multi', // Since we generate for multiple platforms
          content_type: 'analysis'
        });
      
      if (feedbackError) {
        console.error('Error recording feedback:', feedbackError);
        return;
      }
      
      // Update voice profile based on feedback
      if (feedback.rating >= 4) {
        // Positive feedback - reinforce current patterns
        await this.reinforceVoicePatterns(userId);
      } else if (feedback.rating <= 2) {
        // Negative feedback - consider adjustments
        await this.adjustVoiceProfile(userId, feedback);
      }
      
    } catch (error) {
      console.error('Error processing voice feedback:', error);
    }
  }

  private async reinforceVoicePatterns(userId: string): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Increment voice maturity score
    const { error } = await supabase
      .from('voice_profiles')
      .update({
        voice_maturity_score: supabase.rpc('increment', { x: 0.05 }),
        feedback_count: supabase.rpc('increment', { x: 1 }),
        last_feedback_date: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error reinforcing voice patterns:', error);
    }
  }

  private async adjustVoiceProfile(
    userId: string,
    feedback: any
  ): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch current profile
    const { data: profile, error: fetchError } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !profile) {
      console.error('Error fetching profile for adjustment:', fetchError);
      return;
    }
    
    // Prepare updates based on feedback
    const updates: any = {
      feedback_count: profile.feedback_count + 1,
      last_feedback_date: new Date().toISOString()
    };
    
    // Add new natural phrases if provided
    if (feedback.phrasesToAdd && feedback.phrasesToAdd.length > 0) {
      updates.natural_phrases = [
        ...(profile.natural_phrases || []),
        ...feedback.phrasesToAdd
      ];
    }
    
    // Add phrases to avoid if provided
    if (feedback.phrasesToRemove && feedback.phrasesToRemove.length > 0) {
      updates.avoided_phrases = [
        ...(profile.avoided_phrases || []),
        ...feedback.phrasesToRemove
      ];
    }
    
    // Adjust tone based on feedback
    if (feedback.toneAdjustment) {
      switch (feedback.toneAdjustment) {
        case 'more_formal':
          updates.formality_level = Math.min(5, (profile.formality_level || 3) + 1);
          break;
        case 'less_formal':
          updates.formality_level = Math.max(0, (profile.formality_level || 3) - 1);
          break;
        case 'more_expert':
          updates.vocabulary_level = 'academic';
          updates.research_depth = 'deep';
          break;
        case 'less_expert':
          updates.vocabulary_level = 'professional';
          updates.research_depth = 'moderate';
          break;
      }
    }
    
    // Apply updates
    const { error: updateError } = await supabase
      .from('voice_profiles')
      .update(updates)
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating voice profile:', updateError);
    } else {
      // Record the change in learning history
      await supabase
        .from('voice_learning_history')
        .insert({
          user_id: userId,
          change_type: 'pattern_update',
          old_value: {
            natural_phrases: profile.natural_phrases,
            avoided_phrases: profile.avoided_phrases,
            formality_level: profile.formality_level
          },
          new_value: updates,
          trigger_source: 'user_feedback'
        });
    }
  }
}