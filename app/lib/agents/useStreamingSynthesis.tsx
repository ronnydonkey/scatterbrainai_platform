import { useState, useCallback } from 'react';

interface SynthesisState {
  stage: 'idle' | 'researching' | 'analyzing' | 'creating' | 'saving' | 'complete' | 'error';
  message: string;
  progress: {
    research: { complete: boolean; time?: number; preview?: any };
    analysis: { complete: boolean; time?: number; preview?: any };
    content: { complete: boolean; time?: number };
  };
  result?: any;
  thoughtId?: string;
  error?: string;
}

export function useStreamingSynthesis() {
  const [state, setState] = useState<SynthesisState>({
    stage: 'idle',
    message: '',
    progress: {
      research: { complete: false },
      analysis: { complete: false },
      content: { complete: false }
    }
  });

  const synthesize = useCallback(async (input: string, token: string) => {
    // Reset state
    setState({
      stage: 'researching',
      message: 'Starting synthesis...',
      progress: {
        research: { complete: false },
        analysis: { complete: false },
        content: { complete: false }
      }
    });

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ input })
      });

      if (!response.ok) {
        throw new Error('Failed to start synthesis');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Update state based on event
              if (data.status === 'initialized') {
                setState(prev => ({ ...prev, message: data.message }));
              } else if (data.stage === 'research') {
                if (data.status === 'processing') {
                  setState(prev => ({ 
                    ...prev, 
                    stage: 'researching',
                    message: data.message 
                  }));
                } else if (data.status === 'complete') {
                  setState(prev => ({ 
                    ...prev, 
                    progress: {
                      ...prev.progress,
                      research: { complete: true, time: data.time, preview: data.preview }
                    }
                  }));
                }
              } else if (data.stage === 'analysis') {
                if (data.status === 'processing') {
                  setState(prev => ({ 
                    ...prev, 
                    stage: 'analyzing',
                    message: data.message 
                  }));
                } else if (data.status === 'complete') {
                  setState(prev => ({ 
                    ...prev, 
                    progress: {
                      ...prev.progress,
                      analysis: { complete: true, time: data.time, preview: data.preview }
                    }
                  }));
                }
              } else if (data.stage === 'content') {
                if (data.status === 'processing') {
                  setState(prev => ({ 
                    ...prev, 
                    stage: 'creating',
                    message: data.message 
                  }));
                } else if (data.status === 'complete') {
                  setState(prev => ({ 
                    ...prev, 
                    progress: {
                      ...prev.progress,
                      content: { complete: true, time: data.time }
                    }
                  }));
                }
              } else if (data.stage === 'saving') {
                setState(prev => ({ 
                  ...prev, 
                  stage: 'saving',
                  message: data.message 
                }));
              } else if (data.stage === 'complete') {
                setState(prev => ({ 
                  ...prev, 
                  stage: 'complete',
                  message: 'Synthesis complete!',
                  result: data.result,
                  thoughtId: data.thoughtId
                }));
              } else if (data.stage === 'error') {
                setState(prev => ({ 
                  ...prev, 
                  stage: 'error',
                  message: 'Synthesis failed',
                  error: data.error
                }));
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        stage: 'error',
        message: 'Failed to synthesize',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      stage: 'idle',
      message: '',
      progress: {
        research: { complete: false },
        analysis: { complete: false },
        content: { complete: false }
      }
    });
  }, []);

  return {
    state,
    synthesize,
    reset
  };
}

// Example component using the hook
export function StreamingSynthesisDemo() {
  const { state, synthesize } = useStreamingSynthesis();
  const [input, setInput] = useState('');

  const handleSubmit = async () => {
    const token = 'your-auth-token'; // Get from your auth context
    await synthesize(input, token);
  };

  return (
    <div className="p-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded"
        placeholder="Enter your thoughts..."
      />
      
      <button
        onClick={handleSubmit}
        disabled={state.stage !== 'idle' && state.stage !== 'complete' && state.stage !== 'error'}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Synthesize
      </button>

      {/* Progress Display */}
      {state.stage !== 'idle' && (
        <div className="mt-4 space-y-2">
          {/* Stage indicator */}
          <div className="text-lg font-semibold">
            {state.stage === 'researching' && '🔍 Research Agent working...'}
            {state.stage === 'analyzing' && '🧠 Analysis Agent thinking...'}
            {state.stage === 'creating' && '✨ Content Agent polishing...'}
            {state.stage === 'saving' && '💾 Saving your insight...'}
            {state.stage === 'complete' && '🎉 Complete!'}
            {state.stage === 'error' && '❌ Error occurred'}
          </div>

          {/* Progress bars */}
          <div className="space-y-1">
            <ProgressStep 
              label="Research" 
              complete={state.progress.research.complete}
              time={state.progress.research.time}
              preview={state.progress.research.preview}
            />
            <ProgressStep 
              label="Analysis" 
              complete={state.progress.analysis.complete}
              time={state.progress.analysis.time}
              preview={state.progress.analysis.preview}
            />
            <ProgressStep 
              label="Content" 
              complete={state.progress.content.complete}
              time={state.progress.content.time}
            />
          </div>

          {/* Message */}
          {state.message && (
            <p className="text-sm text-gray-600">{state.message}</p>
          )}

          {/* Error */}
          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          {/* Result preview */}
          {state.result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold">{state.result.summary.headline}</h3>
              <p className="text-sm mt-2">{state.result.summary.overview}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressStep({ label, complete, time, preview }: any) {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-4 h-4 rounded-full ${complete ? 'bg-green-500' : 'bg-gray-300'}`} />
      <span className="text-sm font-medium">{label}</span>
      {time && <span className="text-xs text-gray-500">({time}ms)</span>}
      {preview && (
        <span className="text-xs text-gray-600">
          {preview.topics && `Topics: ${preview.topics.join(', ')}`}
          {preview.patterns && `${preview.patterns} patterns found`}
        </span>
      )}
    </div>
  );
}