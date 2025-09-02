export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Page - Deployment Working</h1>
      <p>If you can see this, the deployment is working.</p>
      <div className="mt-4 space-y-2">
        <div><a href="/app" className="text-blue-600 underline">Go to /app</a></div>
        <div><a href="/app/dashboard" className="text-blue-600 underline">Go to /app/dashboard</a></div>
        <div><a href="/debug-auth" className="text-blue-600 underline">Go to /debug-auth</a></div>
      </div>
    </div>
  )
}