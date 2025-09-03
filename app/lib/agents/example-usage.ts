// Example usage of the new 3-agent pipeline API

/**
 * Call the new 3-agent pipeline endpoint
 */
export async function analyzeWithAgentPipeline(
  content: string,
  sourceType: 'text' | 'url' = 'text',
  token: string
) {
  try {
    const response = await fetch('/api/analyze-content-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content,
        sourceType,
        userProfile: {
          // Optional: customize the analysis style
          voice: 'insightful and engaging',
          expertise: ['technology', 'innovation', 'research'],
          preferences: {
            tone: 'professional yet accessible',
            sophistication: 'professional',
            includeExploration: true
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }

    const result = await response.json();
    
    // The response includes:
    // - thoughtId: ID of the saved thought
    // - summary: { headline, overview }
    // - insights: Array of formatted insights with titles, descriptions, icons
    // - actions: Array of action items with priorities
    // - highlights: Key takeaways
    // - analysis: Full analysis data (for backward compatibility)
    // - timing: Performance metrics for each agent
    
    return result;
  } catch (error) {
    console.error('Failed to analyze content:', error);
    throw error;
  }
}

/**
 * Example of using the response in your UI
 */
export function renderAnalysisResults(results: any) {
  return {
    // Display the headline
    headline: results.summary.headline,
    
    // Show overview
    overview: results.summary.overview,
    
    // Render insights as cards
    insightCards: results.insights.map((insight: any) => ({
      title: insight.title,
      description: insight.description,
      icon: insight.icon, // Use this to show an appropriate icon
      color: insight.color // Use this for theming
    })),
    
    // Show action items
    actionItems: results.actions.map((action: any) => ({
      text: action.action,
      reason: action.rationale,
      priority: action.priority // 'high', 'medium', 'low'
    })),
    
    // Display key highlights
    highlights: results.highlights,
    
    // Performance info (useful for debugging)
    performance: {
      researchTime: `${results.timing.research}ms`,
      analysisTime: `${results.timing.analysis}ms`,
      contentTime: `${results.timing.content}ms`,
      totalTime: `${results.timing.total}ms`
    }
  };
}

/**
 * Compare with old endpoint (for migration)
 */
export async function compareEndpoints(content: string, token: string) {
  console.log('Testing both endpoints...');
  
  // Time the old endpoint
  const oldStart = Date.now();
  const oldResponse = await fetch('/api/analyze-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content, sourceType: 'text' })
  });
  const oldTime = Date.now() - oldStart;
  const oldResult = await oldResponse.json();
  
  // Time the new endpoint
  const newStart = Date.now();
  const newResult = await analyzeWithAgentPipeline(content, 'text', token);
  const newTime = Date.now() - newStart;
  
  console.log('Performance Comparison:');
  console.log(`Old endpoint: ${oldTime}ms`);
  console.log(`New endpoint: ${newTime}ms (${newResult.timing.total}ms internal)`);
  console.log(`Agent breakdown: Research ${newResult.timing.research}ms, Analysis ${newResult.timing.analysis}ms, Content ${newResult.timing.content}ms`);
  
  return {
    old: { result: oldResult, time: oldTime },
    new: { result: newResult, time: newTime }
  };
}