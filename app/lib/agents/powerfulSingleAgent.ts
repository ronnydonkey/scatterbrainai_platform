import Anthropic from '@anthropic-ai/sdk';

interface PlatformContent {
  twitter: string;
  linkedin: string;
  reddit: string;
  youtube: {
    title: string;
    description: string;
    hook_script: string;
    main_points: string[];
    conclusion: string;
  };
}

interface AnalysisResult {
  summary: {
    headline: string;
    overview: string;
    key_insight: string;
  };
  insights: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
  themes: string[];
  connections: string[];
  platform_content: PlatformContent;
  action_items: string[];
  metadata: {
    processing_time: number;
  };
}

class PowerfulSingleAgent {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  async analyze(input: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    const systemPrompt = `You are an expert content strategist and viral content creator. Your job is to analyze content and create platform-specific versions that will maximize engagement.

IMPORTANT: Be insightful, surprising, and thought-provoking. Find the non-obvious angles. Create content that makes people stop scrolling.

Your response must be valid JSON with this exact structure:
{
  "summary": {
    "headline": "A compelling headline that captures the essence",
    "overview": "2-3 sentence overview that explains the core idea",
    "key_insight": "The most surprising or valuable insight"
  },
  "insights": [
    {
      "title": "Insight title",
      "description": "Detailed explanation",
      "impact": "Why this matters"
    }
  ],
  "themes": ["theme1", "theme2", "theme3"],
  "connections": ["connection1", "connection2"],
  "platform_content": {
    "twitter": "A viral Twitter thread (use \\n\\n between tweets, number them 1/, 2/, etc. Include hooks, data, stories)",
    "linkedin": "Professional thought leadership post with personal story and business insights",
    "reddit": "Authentic discussion starter that sparks debate and sharing of experiences",
    "youtube": {
      "title": "Click-worthy title with curiosity gap",
      "description": "SEO-optimized description",
      "hook_script": "First 15 seconds script that hooks viewers",
      "main_points": ["Point 1", "Point 2", "Point 3"],
      "conclusion": "Call to action and closing thoughts"
    }
  },
  "action_items": ["Actionable takeaway 1", "Actionable takeaway 2"]
}`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Analyze this content and create viral, platform-optimized versions. Be creative, find surprising angles, and make it shareable:\n\n${input}`
        }]
      });

      const content = message.content[0];
      if (content.type === 'text') {
        const result = this.parseJSON(content.text);
        result.metadata = {
          processing_time: Date.now() - startTime
        };
        return result;
      }
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Analysis Error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseJSON(text: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      console.log('Raw response:', text);
      // Return a default structure if parsing fails
      return {
        summary: {
          headline: "Analysis Complete",
          overview: text.slice(0, 200),
          key_insight: "Processing completed"
        },
        insights: [],
        themes: [],
        connections: [],
        platform_content: {
          twitter: text.slice(0, 280),
          linkedin: text.slice(0, 500),
          reddit: text.slice(0, 500),
          youtube: {
            title: "Content Analysis",
            description: text.slice(0, 200),
            hook_script: "",
            main_points: [],
            conclusion: ""
          }
        },
        action_items: []
      };
    }
  }
}

export default PowerfulSingleAgent;