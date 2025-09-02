import { EnhancedContentEngine } from './enhanced-content-service';

interface UserProfile {
  voice: string;
  expertise: string[];
  preferences: {
    tone: string;
    sophistication: 'casual' | 'professional' | 'academic';
    includeExploration: boolean;
  };
}

export async function handleEnhancedContentGeneration(
  topic: string,
  userProfile: UserProfile
) {
  const engine = new EnhancedContentEngine();
  
  try {
    const result = await engine.generatePremiumContent(topic, userProfile);
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Enhanced content generation error:', error);
    return {
      success: false,
      error: 'Content generation failed',
      fallback: 'Using basic content generation...'
    };
  }
}