'use client'

export default function AppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">ScatterBrainAI App</h1>
        <p className="text-gray-600 mb-4">Simple page without any hooks or auth</p>
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full px-4 py-2 border rounded"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-2 border rounded"
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}