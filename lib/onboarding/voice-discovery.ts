// Voice Discovery Onboarding System
// Reveals authentic voice patterns through strategic questions

export interface VoiceDiscoveryQuestion {
  id: string;
  question: string;
  context?: string;
  type: 'text' | 'multiple_choice' | 'scale' | 'multi_select';
  options?: string[];
  followUp?: (answer: any) => VoiceDiscoveryQuestion | null;
}

export interface VoiceDiscoveryResponse {
  questionId: string;
  answer: any;
  timestamp: Date;
}

export interface VoiceArchetypeResult {
  primary: string;
  confidence: number;
  traits: string[];
  recommendations: string[];
}

export const voiceDiscoveryQuestions: VoiceDiscoveryQuestion[] = [
  {
    id: 'writing_excitement',
    question: "When you discover something fascinating, what's your first instinct?",
    type: 'multiple_choice',
    options: [
      "I want to understand every detail and connection",
      "I need to share it with others immediately", 
      "I start thinking about how to use or apply it",
      "I wonder what else this could lead to"
    ]
  },
  {
    id: 'expertise_claim',
    question: "Which statement best describes your relationship with knowledge?",
    type: 'multiple_choice',
    options: [
      "I share what I'm learning as I discover it",
      "I teach concepts I've thoroughly mastered",
      "I connect ideas from different areas I've studied",
      "I focus on practical applications I've tested"
    ]
  },
  {
    id: 'content_fear',
    question: "What concerns you most when sharing your thoughts publicly?",
    type: 'multiple_choice',
    options: [
      "Sounding like I know more than I actually do",
      "Not explaining things clearly enough",
      "Missing important connections or nuances",
      "Sharing advice that doesn't actually work"
    ]
  },
  {
    id: 'natural_phrases',
    question: "Which phrases feel most natural to you? (Select all that apply)",
    type: 'multi_select',
    options: [
      "I've been exploring...",
      "In my experience...",
      "Research suggests...",
      "Here's what I've learned...",
      "Let me break this down...",
      "This reminds me of...",
      "The data shows...",
      "I've found that...",
      "What if we considered...",
      "The key insight is..."
    ]
  },
  {
    id: 'expertise_areas',
    question: "In which areas do you have genuine, hands-on expertise? (Be honest - this ensures authentic content)",
    context: "Select only areas where you have substantial experience or formal training",
    type: 'text',
  },
  {
    id: 'learning_areas',
    question: "What topics are you actively learning about but wouldn't claim expertise in?",
    context: "These will be positioned as explorations rather than expert insights",
    type: 'text',
  },
  {
    id: 'voice_inspiration',
    question: "Whose writing or speaking style do you admire and why?",
    context: "This helps us understand your aspirational voice",
    type: 'text',
  }
];

export class VoiceDiscoveryAnalyzer {
  analyzeResponses(responses: VoiceDiscoveryResponse[]): VoiceArchetypeResult {
    const scores = {
      explorer: 0,
      teacher: 0,
      synthesizer: 0,
      implementer: 0
    };

    // Analyze each response
    responses.forEach(response => {
      switch (response.questionId) {
        case 'writing_excitement':
          const excitementMap: Record<number, keyof typeof scores> = {
            0: 'synthesizer',
            1: 'teacher',
            2: 'implementer',
            3: 'explorer'
          };
          scores[excitementMap[response.answer as number]] += 2;
          break;

        case 'expertise_claim':
          const expertiseMap: Record<number, keyof typeof scores> = {
            0: 'explorer',
            1: 'teacher',
            2: 'synthesizer',
            3: 'implementer'
          };
          scores[expertiseMap[response.answer as number]] += 2;
          break;

        case 'content_fear':
          const fearMap: Record<number, keyof typeof scores> = {
            0: 'explorer',
            1: 'teacher',
            2: 'synthesizer',
            3: 'implementer'
          };
          scores[fearMap[response.answer as number]] += 1;
          break;

        case 'natural_phrases':
          const phrases = response.answer as string[];
          phrases.forEach(phrase => {
            if (phrase.includes('exploring') || phrase.includes('learned')) scores.explorer += 0.5;
            if (phrase.includes('break') || phrase.includes('key insight')) scores.teacher += 0.5;
            if (phrase.includes('reminds') || phrase.includes('data')) scores.synthesizer += 0.5;
            if (phrase.includes('experience') || phrase.includes('found')) scores.implementer += 0.5;
          });
          break;
      }
    });

    // Find primary archetype
    const primary = Object.entries(scores).reduce((a, b) => 
      scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
    )[0];

    // Calculate confidence
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = scores[primary as keyof typeof scores] / totalScore;

    // Get archetype traits
    const archetypeTraits: Record<string, string[]> = {
      explorer: ['curious', 'questioning', 'discovery-oriented', 'learning-focused'],
      teacher: ['clear', 'structured', 'helpful', 'explanatory'],
      synthesizer: ['connective', 'analytical', 'pattern-seeking', 'integrative'],
      implementer: ['practical', 'action-oriented', 'results-focused', 'experiential']
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(primary, responses);

    return {
      primary,
      confidence,
      traits: archetypeTraits[primary] || [],
      recommendations
    };
  }

  private generateRecommendations(archetype: string, responses: VoiceDiscoveryResponse[]): string[] {
    const recommendations: string[] = [];

    switch (archetype) {
      case 'explorer':
        recommendations.push(
          "Position yourself as a fellow learner discovering insights alongside your audience",
          "Use phrases like 'I discovered' and 'What I'm learning' to maintain authenticity",
          "Share your research process and sources to build credibility without false expertise"
        );
        break;

      case 'teacher':
        recommendations.push(
          "Focus on breaking down complex topics into digestible insights",
          "Use analogies and examples to make concepts accessible",
          "Structure content with clear learning objectives and takeaways"
        );
        break;

      case 'synthesizer':
        recommendations.push(
          "Highlight connections between different domains and ideas",
          "Use visual frameworks and models to illustrate relationships",
          "Position yourself as a pattern-recognizer and connector of concepts"
        );
        break;

      case 'implementer':
        recommendations.push(
          "Lead with practical applications and real-world examples",
          "Share specific steps and actionable frameworks",
          "Focus on outcomes and results rather than theory"
        );
        break;
    }

    // Add expertise-specific recommendations
    const expertiseResponse = responses.find(r => r.questionId === 'expertise_areas');
    if (expertiseResponse && expertiseResponse.answer) {
      recommendations.push(
        `Leverage your expertise in ${expertiseResponse.answer} to add unique perspectives`,
        "Feel confident sharing first-hand experiences in your areas of expertise"
      );
    }

    return recommendations;
  }

  generateVoiceProfile(
    archetype: VoiceArchetypeResult,
    responses: VoiceDiscoveryResponse[]
  ): Partial<VoiceProfile> {
    const naturalPhrases = responses.find(r => r.questionId === 'natural_phrases')?.answer as string[] || [];
    const expertiseAreas = responses.find(r => r.questionId === 'expertise_areas')?.answer as string || '';
    const learningAreas = responses.find(r => r.questionId === 'learning_areas')?.answer as string || '';

    const profile: Partial<VoiceProfile> = {
      archetype: archetype.primary,
      archetype_confidence: archetype.confidence,
      natural_phrases: naturalPhrases,
      confirmed_expertise: expertiseAreas.split(',').map(e => e.trim()).filter(Boolean),
      learning_interests: learningAreas.split(',').map(e => e.trim()).filter(Boolean),
      onboarding_responses: responses,
      
      // Set defaults based on archetype
      vocabulary_level: this.getVocabularyLevel(archetype.primary),
      sentence_complexity: this.getSentenceComplexity(archetype.primary),
      engagement_style: this.getEngagementStyle(archetype.primary),
      research_depth: this.getResearchDepth(archetype.primary),
    };

    return profile;
  }

  private getVocabularyLevel(archetype: string): string {
    const levels: Record<string, string> = {
      explorer: 'professional',
      teacher: 'professional',
      synthesizer: 'academic',
      implementer: 'professional'
    };
    return levels[archetype] || 'professional';
  }

  private getSentenceComplexity(archetype: string): string {
    const complexity: Record<string, string> = {
      explorer: 'moderate',
      teacher: 'simple',
      synthesizer: 'complex',
      implementer: 'moderate'
    };
    return complexity[archetype] || 'moderate';
  }

  private getEngagementStyle(archetype: string): string {
    const styles: Record<string, string> = {
      explorer: 'conversational',
      teacher: 'educational',
      synthesizer: 'analytical',
      implementer: 'practical'
    };
    return styles[archetype] || 'conversational';
  }

  private getResearchDepth(archetype: string): string {
    const depths: Record<string, string> = {
      explorer: 'moderate',
      teacher: 'moderate',
      synthesizer: 'deep',
      implementer: 'surface'
    };
    return depths[archetype] || 'moderate';
  }
}

// Type definition for VoiceProfile (matches database schema)
export interface VoiceProfile {
  id?: string;
  user_id: string;
  archetype: string;
  archetype_confidence: number;
  natural_phrases: string[];
  avoided_phrases: string[];
  vocabulary_level: string;
  sentence_complexity: string;
  confirmed_expertise: string[];
  learning_interests: string[];
  false_expertise_flags: string[];
  preferred_perspective: string;
  engagement_style: string;
  humor_level: number;
  formality_level: number;
  research_depth: string;
  citation_preference: boolean;
  metaphor_usage: string;
  onboarding_responses: any;
  feedback_count: number;
  last_feedback_date?: Date;
  voice_maturity_score: number;
  created_at?: Date;
  updated_at?: Date;
}