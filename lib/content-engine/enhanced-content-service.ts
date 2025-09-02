import Anthropic from '@anthropic-ai/sdk';

interface UserProfile {
  voice: string;
  expertise: string[];
  preferences: {
    tone: string;
    sophistication: 'casual' | 'professional' | 'academic';
    includeExploration: boolean;
  };
}

interface ResearchResults {
  keyDimensions: string[];
  expertPerspectives: string[];
  counterintuitiveFindings: string[];
  crossDisciplinaryConnections: string[];
  currentDevelopments: string[];
  authorityFigures: string[];
  domain: string;
}

interface EnhancedContent {
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
  researchContext: ResearchResults;
}

export class EnhancedContentEngine {
  private anthropic: Anthropic;
  private cache = new Map<string, { data: EnhancedContent; timestamp: number }>();
  private cacheTimeout = 1000 * 60 * 60; // 1 hour cache
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  private getCacheKey(topic: string, userProfile: UserProfile): string {
    return `${topic.toLowerCase().trim()}-${JSON.stringify(userProfile)}`;
  }

  private getFromCache(key: string): EnhancedContent | null {
    const cached = this.cache.get(key);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < this.cacheTimeout) {
        console.log('🎯 Returning cached result for:', key);
        return cached.data;
      } else {
        // Remove expired cache
        this.cache.delete(key);
      }
    }
    return null;
  }

  private setCache(key: string, data: EnhancedContent): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  async generatePremiumContent(
    topic: string, 
    userProfile: UserProfile
  ): Promise<EnhancedContent> {
    console.log(`🧠 Starting premium content generation for: ${topic}`);
    
    // Check cache first
    const cacheKey = this.getCacheKey(topic, userProfile);
    const cachedResult = this.getFromCache(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Step 1: Deep Research Phase
    const research = await this.conductDeepResearch(topic);
    
    // Step 2: Content Generation with Research Context
    const content = await this.createSophisticatedContent(topic, research, userProfile);
    
    // Step 3: Add Exploration Paths
    const explorationPaths = await this.generateExplorationPaths(topic, research);
    
    const result = {
      content,
      explorationPaths,
      researchContext: research
    };
    
    // Cache the result
    this.setCache(cacheKey, result);
    
    return result;
  }

  private async conductDeepResearch(topic: string): Promise<ResearchResults> {
    console.log(`🔍 Conducting deep research on: ${topic}`);
    
    const researchPrompt = `
      You are a research director preparing comprehensive briefing materials on: ${topic}
      
      Your task is to conduct PhD-level analysis that would satisfy experts in any related field.
      This research will inform sophisticated content creation that elevates beyond surface-level insights.
      
      Complete this structured analysis:
      
      1. DOMAIN MAPPING: 
         - What field/discipline does this topic belong to? 
         - What 3-4 related fields should we explore for cross-disciplinary insights?
         - Is this a niche hobby, professional domain, academic subject, or cultural phenomenon?
      
      2. EXPERT LANDSCAPE: 
         - Who are 4-6 leading researchers, practitioners, or thought leaders in this space?
         - What institutions or organizations are authoritative?
         - What are the key books, papers, or resources experts reference?
      
      3. HIDDEN DIMENSIONS: 
         - What aspects do casual enthusiasts typically miss or overlook?
         - What would only someone with deep experience notice?
         - What are the subtle nuances that separate novices from experts?
      
      4. SURPRISING CONNECTIONS: 
         - How does this connect to psychology, economics, design, or technology in non-obvious ways?
         - What broader human patterns or principles does this illuminate?
         - What other seemingly unrelated fields share underlying principles?
      
      5. CURRENT STATE (2023-2025): 
         - What's happening in this space right now?
         - What recent developments would surprise even knowledgeable people?
         - What questions are researchers/practitioners currently grappling with?
      
      6. COUNTERINTUITIVE FINDINGS: 
         - What common beliefs about this topic does research contradict?
         - What would surprise even people who consider themselves knowledgeable?
         - What "obvious" assumptions turn out to be wrong?
      
      Respond in valid JSON format with these exact keys:
      {
        "domain": "primary field classification",
        "keyDimensions": ["dimension1", "dimension2", "dimension3"],
        "expertPerspectives": ["expert1 with brief credential", "expert2 with credential"],
        "counterintuitiveFindings": ["finding1", "finding2"],
        "crossDisciplinaryConnections": ["connection1", "connection2"], 
        "currentDevelopments": ["development1", "development2"],
        "authorityFigures": ["name1: credential/book", "name2: credential/book"]
      }
    `;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500,
      messages: [{ role: 'user', content: researchPrompt }]
    });
    
    try {
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Research parsing error:', error);
      // Return fallback structure
      return {
        domain: topic,
        keyDimensions: ['foundational concepts', 'practical applications', 'current trends'],
        expertPerspectives: ['leading researchers in the field'],
        counterintuitiveFindings: ['challenging conventional wisdom'],
        crossDisciplinaryConnections: ['psychology', 'technology'],
        currentDevelopments: ['emerging trends and innovations'],
        authorityFigures: ['key thought leaders']
      };
    }
  }

  private async createSophisticatedContent(
    topic: string, 
    research: ResearchResults, 
    userProfile: UserProfile
  ): Promise<{ twitter: string; linkedin: string; reddit: string; youtube: string }> {
    console.log(`✨ Creating sophisticated content for: ${topic}`);
    
    const contentPrompt = `
      You are creating premium content about "${topic}" that would satisfy someone with expertise in ${research.domain}.
      
      RESEARCH CONTEXT: ${JSON.stringify(research, null, 2)}
      
      USER VOICE PROFILE:
      - Writing Style: ${userProfile.voice}
      - Expertise Areas: ${userProfile.expertise.join(', ')}
      - Tone: ${userProfile.preferences.tone}
      - Sophistication Level: ${userProfile.preferences.sophistication}
      
      CONTENT REQUIREMENTS:
      Each piece should feel like a mini-masterclass that demonstrates deep understanding.
      Lead with non-obvious insights that would make domain experts nod in recognition.
      Include specific evidence, examples, or references from the research context.
      Connect to broader principles or implications.
      Maintain the user's voice while elevating intellectual sophistication.
      
      Create content for each platform:
      
      TWITTER/X (280 chars): 
      - Hook with counterintuitive insight
      - Specific evidence or example
      - Thought-provoking question or implication
      
      LINKEDIN (1200-1500 chars):
      - Professional analysis with industry implications
      - Specific examples or data points  
      - Actionable insight for professionals
      - End with engagement question
      
      REDDIT (2000-2500 chars):
      - Deep dive that provides genuine value to community
      - Multiple perspectives or examples
      - Anticipate and address potential objections
      - Include specific details that demonstrate expertise
      
      YOUTUBE (Video concept + key talking points):
      - Compelling video concept/title
      - 3-4 main talking points with specific examples
      - Hook for opening 30 seconds
      - Call-to-action for engagement
      
      Respond in JSON format:
      {
        "twitter": "content here",
        "linkedin": "content here", 
        "reddit": "content here",
        "youtube": "content here"
      }
    `;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: contentPrompt }]
    });
    
    try {
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Content parsing error:', error);
      return {
        twitter: `Exploring the fascinating world of ${topic}...`,
        linkedin: `Insights into ${topic} and its implications for modern professionals...`,
        reddit: `Deep dive: What most people get wrong about ${topic}...`,
        youtube: `The Surprising Truth About ${topic} (3 Things Experts Know)`
      };
    }
  }

  private async generateExplorationPaths(
    topic: string, 
    research: ResearchResults
  ): Promise<{
    podcasts: string[];
    researchers: string[];
    relatedTopics: string[];
    practicalApplications: string[];
  }> {
    console.log(`🔗 Generating exploration paths for: ${topic}`);
    
    const explorationPrompt = `
      Given this topic and research context, provide specific "explore further" recommendations:
      
      TOPIC: ${topic}
      RESEARCH CONTEXT: ${JSON.stringify(research)}
      
      Provide specific, actionable exploration paths:
      
      1. PODCASTS/VIDEOS (3-4 specific recommendations):
         - Include actual podcast names and episode titles when possible
         - YouTube channels or specific video titles
         - Be as specific as possible with names and titles
      
      2. KEY RESEARCHERS/AUTHORS (3-4 people to follow):
         - Specific names with their primary contribution or book
         - Current active researchers, not just historical figures
         - Include their primary platform (Twitter, Substack, etc.)
      
      3. RELATED TOPICS (3 surprising connections):
         - Topics that connect to this one in non-obvious ways
         - Areas for further exploration that broaden understanding
      
      4. PRACTICAL APPLICATIONS (2-3 concrete experiments/exercises):
         - Specific things someone could do to apply these insights
         - Experiments they could try
         - Tools or methods to explore
      
      Be specific with names, titles, and actionable steps. Avoid generic suggestions.
      
      Respond in JSON format:
      {
        "podcasts": ["specific podcast: episode title", "youtube channel: video title"],
        "researchers": ["Name: Book/Contribution (Platform)", "Name: Area (Platform)"],
        "relatedTopics": ["topic 1", "topic 2", "topic 3"],
        "practicalApplications": ["specific action 1", "specific action 2"]
      }
    `;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: explorationPrompt }]
    });
    
    try {
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Exploration paths parsing error:', error);
      return {
        podcasts: [`Search for podcasts about ${topic} on Apple Podcasts or Spotify`],
        researchers: [`Look up leading researchers in ${research.domain}`],
        relatedTopics: [`Related topics in ${research.domain}`],
        practicalApplications: [`Try applying ${topic} concepts in your daily work`]
      };
    }
  }
}