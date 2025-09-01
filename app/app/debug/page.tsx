'use client'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-semibold mb-2">Environment Variables:</h2>
        <ul className="space-y-2 font-mono text-sm">
          <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}</li>
        </ul>
      </div>
    </div>
  )
}