import { Navigation } from '@/components/landing/Navigation'
import { Brain, Heart, Sparkles, Shield } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About ScatterBrain AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're building the future of personal knowledge management, where AI helps you capture, 
            understand, and share your thoughts in your authentic voice.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center mb-8">
              To empower individuals to build their external brain - a personalized AI companion that 
              understands their thoughts, preserves their knowledge, and helps them create content that 
              truly represents who they are.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Capture Everything</h3>
                <p className="text-gray-600">
                  Never lose a thought. From fleeting ideas to deep insights, we help you capture and organize 
                  your mental universe.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Understanding</h3>
                <p className="text-gray-600">
                  Our AI doesn't just store - it understands. It learns your voice, identifies patterns, 
                  and helps you see connections you might have missed.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Authentic Voice</h3>
                <p className="text-gray-600">
                  Create content that sounds like you. Our voice discovery helps ensure every piece of 
                  content reflects your unique perspective.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  Your thoughts are yours. We use industry-leading security and never train our AI on your 
                  personal data without explicit permission.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Heart className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Human-Centered AI</h3>
                <p className="text-gray-600">
                  AI should enhance human creativity, not replace it. We build tools that amplify your 
                  unique voice and perspective.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Continuous Innovation</h3>
                <p className="text-gray-600">
                  We're constantly improving our AI to better understand and serve your needs, always 
                  staying at the forefront of technology.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Knowledge Liberation</h3>
                <p className="text-gray-600">
                  Your knowledge should work for you. We make it easy to access, share, and build upon 
                  everything you've learned.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your External Brain?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of thinkers, creators, and innovators who are already using ScatterBrain AI.
          </p>
          <a
            href="/app/create"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Get Started Free
          </a>
        </div>
      </main>
      
      {/* Footer component to be added */}
    </div>
  )
}