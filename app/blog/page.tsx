import { Navigation } from '@/components/landing/Navigation'
import { Calendar, Clock, ArrowRight, Brain, Sparkles, Heart } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  slug: string
  featured?: boolean
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Science Behind External Brains: How AI Amplifies Human Memory',
    excerpt: 'Discover how combining AI with personal knowledge management creates a powerful extension of your natural memory and thinking processes.',
    date: 'September 2, 2025',
    readTime: '8 min read',
    category: 'AI & Neuroscience',
    slug: 'science-behind-external-brains',
    featured: true
  },
  {
    id: '2',
    title: 'Finding Your Authentic Voice: A Guide to Voice Discovery',
    excerpt: 'Learn how our voice discovery process helps ensure that AI-generated content maintains your unique perspective and style.',
    date: 'August 28, 2025',
    readTime: '6 min read',
    category: 'Product Features',
    slug: 'finding-your-authentic-voice'
  },
  {
    id: '3',
    title: 'From Scattered Thoughts to Structured Insights: Real User Stories',
    excerpt: 'Three inspiring stories of how creators, entrepreneurs, and writers transformed their thinking with ScatterBrain AI.',
    date: 'August 20, 2025',
    readTime: '10 min read',
    category: 'User Stories',
    slug: 'scattered-thoughts-to-insights'
  },
  {
    id: '4',
    title: 'Privacy-First AI: How We Protect Your Thoughts',
    excerpt: 'A deep dive into our security architecture and commitment to keeping your personal knowledge private and secure.',
    date: 'August 15, 2025',
    readTime: '7 min read',
    category: 'Security & Privacy',
    slug: 'privacy-first-ai'
  },
  {
    id: '5',
    title: 'The Creative Process in the Age of AI: Enhancement, Not Replacement',
    excerpt: 'Exploring how AI tools can augment human creativity without diminishing the authentic creative experience.',
    date: 'August 10, 2025',
    readTime: '9 min read',
    category: 'Creativity & AI',
    slug: 'creative-process-age-of-ai'
  },
  {
    id: '6',
    title: 'Building a Second Brain: Why External Memory Matters More Than Ever',
    excerpt: 'In an information-rich world, having a reliable system to capture and retrieve your thoughts is becoming essential.',
    date: 'August 5, 2025',
    readTime: '5 min read',
    category: 'Productivity',
    slug: 'building-second-brain'
  }
]

const categories = ['All', 'AI & Neuroscience', 'Product Features', 'User Stories', 'Security & Privacy', 'Creativity & AI', 'Productivity']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Blog & Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the intersection of AI, creativity, and human knowledge. 
            Learn how to build your external brain and amplify your thinking.
          </p>
        </div>

        {/* Featured Post */}
        {blogPosts.filter(post => post.featured).map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
            <div className="flex items-center space-x-2 text-sm text-purple-600 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Featured Post</span>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors cursor-pointer">
              {post.title}
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {post.date}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {post.category}
                </span>
              </div>
              
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
                <span>Read More</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                category === 'All' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.filter(post => !post.featured).map(post => (
            <article key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {post.category}
                  </span>
                  
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                    Read <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
          <Brain className="w-16 h-16 mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Get the latest insights on AI, creativity, and building your external brain. 
            Join our newsletter for weekly updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm text-blue-200 mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </main>
      
      {/* Footer component to be added */}
    </div>
  )
}