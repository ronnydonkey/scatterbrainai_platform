'use client'

export default function DebugEnvPage() {
  // Only show non-sensitive info
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify({
          supabaseUrl: supabaseUrl || 'NOT SET',
          hasSupabaseKey,
          nodeEnv: process.env.NODE_ENV,
        }, null, 2)}
      </pre>
    </div>
  )
}