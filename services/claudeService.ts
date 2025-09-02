export interface AnalysisResult {
  analysis: string
  research_suggestions: string[]
  key_themes: string[]
  connections: string[]
  content_suggestions: {
    x_twitter: string
    reddit: string
    linkedin: string
    youtube_script: string
  }
}

export async function analyzeContent(content: string, sourceType: 'text' | 'url', authToken: string, userProfile?: any): Promise<AnalysisResult> {
  console.log('Analyzing content...')
  
  if (!authToken) {
    throw new Error('Authentication token is required')
  }
  
  try {
    const response = await fetch('/api/analyze-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        content,
        sourceType,
        userProfile
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API request failed with status ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error calling analyze API:', error)
    throw new Error('Failed to analyze content. Please try again.')
  }
}

export async function generatePersonalizedContent(
  content: string, 
  analysis: string, 
  writingStyle: string,
  platform: string,
  authToken: string
): Promise<string> {
  console.log('Generating personalized content for platform:', platform)
  
  if (!authToken) {
    throw new Error('Authentication token is required')
  }
  
  try {
    const prompt = `
Create a ${platform} post based on this content and analysis, personalized to match the user's writing style.

Content: "${content.substring(0, 300)}..."
Analysis: "${analysis}"
User's writing style: "${writingStyle}"

Create engaging, platform-appropriate content that matches the user's voice and style. Make it authentic and compelling for ${platform} audience.
`

    const response = await fetch('/api/analyze-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        content: prompt,
        sourceType: 'text'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API request failed with status ${response.status}`)
    }

    const result = await response.json()
    return result.analysis // Return the generated content
  } catch (error) {
    console.error('Error generating personalized content:', error)
    throw new Error('Failed to generate personalized content. Please try again.')
  }
}