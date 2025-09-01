export async function extractUrlContent(url: string): Promise<string> {
  try {
    new URL(url)
  } catch {
    throw new Error('Please enter a valid URL')
  }

  const corsProxies = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://thingproxy.freeboard.io/fetch/${url}`
  ]

  let lastError: Error | null = null

  for (const proxyUrl of corsProxies) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      try {
        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (compatible; ScatterBrainAI/1.0)'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        let data
        
        if (proxyUrl.includes('allorigins.win')) {
          data = await response.json()
          if (!data.contents) {
            throw new Error('No content returned from proxy')
          }
          return parseHtmlContent(data.contents)
        } else {
          data = await response.text()
          return parseHtmlContent(data)
        }
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out while fetching the URL')
        }
        throw fetchError
      }
    } catch (error: any) {
      lastError = error
      continue
    }
  }

  throw new Error(lastError?.message || 'Unable to fetch content from this URL. The site may be blocking automated requests.')
}

function parseHtmlContent(html: string): string {
  try {
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()

    const lines = textContent.split(/\n+/)
    const meaningfulLines = lines
      .map(line => line.trim())
      .filter(line => {
        const words = line.split(/\s+/)
        return words.length > 3 && line.length > 20
      })
    
    const cleaned = meaningfulLines
      .slice(0, 100)
      .join('\n')
      .substring(0, 5000)
    
    if (cleaned.length < 50) {
      throw new Error('Unable to extract meaningful content from this URL')
    }
    
    return cleaned
  } catch {
    throw new Error('Failed to parse HTML content')
  }
}