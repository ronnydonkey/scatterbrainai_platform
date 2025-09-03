import Anthropic from '@anthropic-ai/sdk';

interface PipelineResults {
  success: boolean;
  research: any;
  analysis: any;
  content: any;
  errors: string[];
  timing: {
    research?: number;
    analysis?: number;
    content?: number;
    total?: number;
  };
}

class ScatterbrainAgents {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }

  /**
   * Agent 1: Research Agent
   * Extracts and structures raw information from scattered thoughts
   */
  async researchAgent(input: string): Promise<any> {
    const systemPrompt = `You are a Research Agent specialized in extracting and organizing information from scattered thoughts.

Your ONLY job is to:
1. Extract key topics and themes
2. Identify important questions or problems
3. List main points and ideas
4. Organize information into clear categories

Output a structured JSON with:
{
  "topics": ["topic1", "topic2"],
  "themes": ["theme1", "theme2"],
  "questions": ["question1", "question2"],
  "keyPoints": ["point1", "point2"],
  "categories": {
    "category1": ["item1", "item2"],
    "category2": ["item1", "item2"]
  },
  "context": "Brief context about the content"
}

Be thorough but concise. Extract ONLY what's explicitly stated or clearly implied.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Extract and organize information from this content:\n\n${input}`
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSON(content.text);
      }
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Research Agent Error:', error);
      throw new Error(`Research Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Agent 2: Analysis Agent
   * Analyzes patterns, connections, and synthesizes insights
   */
  async analysisAgent(researchData: any): Promise<any> {
    const systemPrompt = `You are an Analysis Agent specialized in finding patterns and synthesizing insights.

Your ONLY job is to:
1. Identify patterns across topics and themes
2. Find connections between different ideas
3. Prioritize insights by importance
4. Synthesize key learnings

Input: Structured research data
Output: Deep analysis with actionable insights

Return JSON:
{
  "patterns": [
    {"pattern": "description", "evidence": ["point1", "point2"]}
  ],
  "connections": [
    {"from": "idea1", "to": "idea2", "relationship": "description"}
  ],
  "insights": [
    {"insight": "description", "importance": "high/medium/low", "rationale": "why"}
  ],
  "synthesis": "Overall synthesis paragraph",
  "priorities": ["priority1", "priority2"]
}

Focus on non-obvious insights and meaningful connections.`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Analyze this research data for patterns and insights:\n\n${JSON.stringify(researchData, null, 2)}`
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSON(content.text);
      }
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Analysis Agent Error:', error);
      throw new Error(`Analysis Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Agent 3: Content Agent
   * Creates beautiful, formatted content for presentation
   */
  async contentAgent(analysisData: any, originalInput: string): Promise<any> {
    const systemPrompt = `You are a Content Agent specialized in creating beautiful, engaging presentations of insights.

Your ONLY job is to:
1. Create a compelling summary
2. Format insights for maximum clarity
3. Generate actionable recommendations
4. Highlight key takeaways

Transform analysis into user-friendly content that is:
- Visually organized
- Easy to understand
- Actionable
- Engaging

Return JSON:
{
  "summary": {
    "headline": "Compelling one-line summary",
    "overview": "2-3 sentence overview"
  },
  "formattedInsights": [
    {
      "title": "Insight title",
      "description": "Clear explanation",
      "icon": "suggested-icon-name",
      "color": "suggested-color-theme"
    }
  ],
  "actionItems": [
    {
      "action": "Specific action",
      "rationale": "Why this matters",
      "priority": "high/medium/low"
    }
  ],
  "highlights": [
    "Key takeaway 1",
    "Key takeaway 2"
  ],
  "visualElements": {
    "primaryColor": "color-suggestion",
    "mood": "professional/creative/analytical",
    "emphasis": ["point1", "point2"]
  }
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Create beautiful content from this analysis:\n\nAnalysis: ${JSON.stringify(analysisData, null, 2)}\n\nOriginal Context: ${originalInput.substring(0, 500)}...`
        }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseJSON(content.text);
      }
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Content Agent Error:', error);
      throw new Error(`Content Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Main pipeline: Runs all three agents in sequence
   */
  async processPipeline(input: string): Promise<PipelineResults> {
    const startTime = Date.now();
    const results: PipelineResults = {
      success: false,
      research: null,
      analysis: null,
      content: null,
      errors: [],
      timing: {}
    };

    try {
      // Stage 1: Research
      console.log('Starting Research Agent...');
      const researchStart = Date.now();
      results.research = await this.researchAgent(input);
      results.timing.research = Date.now() - researchStart;
      console.log(`Research completed in ${results.timing.research}ms`);

      // Stage 2: Analysis
      console.log('Starting Analysis Agent...');
      const analysisStart = Date.now();
      results.analysis = await this.analysisAgent(results.research);
      results.timing.analysis = Date.now() - analysisStart;
      console.log(`Analysis completed in ${results.timing.analysis}ms`);

      // Stage 3: Content
      console.log('Starting Content Agent...');
      const contentStart = Date.now();
      results.content = await this.contentAgent(results.analysis, input);
      results.timing.content = Date.now() - contentStart;
      console.log(`Content completed in ${results.timing.content}ms`);

      results.success = true;
      results.timing.total = Date.now() - startTime;
      console.log(`Pipeline completed in ${results.timing.total}ms`);

      return results;
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : 'Unknown error');
      results.timing.total = Date.now() - startTime;
      console.error('Pipeline Error:', error);
      return results;
    }
  }

  /**
   * Utility: Parse JSON with fallback
   */
  parseJSON(text: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // If no JSON found, try parsing the whole text
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON Parse Error:', error);
      console.error('Text:', text);
      // Return a structured fallback
      return {
        error: 'Failed to parse agent response',
        rawText: text
      };
    }
  }

  /**
   * Get formatted output for display
   */
  getFormattedOutput(pipelineResults: any): any {
    if (!pipelineResults.success) {
      return {
        error: true,
        message: pipelineResults.errors.join(', '),
        partial: pipelineResults
      };
    }

    return {
      success: true,
      summary: pipelineResults.content.summary,
      insights: pipelineResults.content.formattedInsights,
      actions: pipelineResults.content.actionItems,
      highlights: pipelineResults.content.highlights,
      visual: pipelineResults.content.visualElements,
      metadata: {
        topics: pipelineResults.research.topics,
        themes: pipelineResults.research.themes,
        patterns: pipelineResults.analysis.patterns,
        timing: pipelineResults.timing
      }
    };
  }
}

export default ScatterbrainAgents;