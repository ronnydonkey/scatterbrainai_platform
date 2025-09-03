import { Navigation } from '@/components/landing/Navigation'
import { BookOpen, Briefcase, Heart, Lightbulb, Music, Code, ChefHat, Dumbbell } from 'lucide-react'

interface ExampleCard {
  icon: React.ElementType
  title: string
  description: string
  tags: string[]
  contentExample: string
  color: string
}

const examples: ExampleCard[] = [
  {
    icon: BookOpen,
    title: "Writer's External Brain",
    description: "A novelist tracking character development, plot ideas, and research notes",
    tags: ["Creative Writing", "World Building", "Character Development"],
    contentExample: "Character arc: Sarah starts as risk-averse accountant, discovers passion for adventure through...",
    color: "blue"
  },
  {
    icon: Briefcase,
    title: "Entrepreneur's Idea Vault",
    description: "A startup founder capturing business ideas, market insights, and growth strategies",
    tags: ["Business Strategy", "Market Analysis", "Product Development"],
    contentExample: "SaaS idea: AI-powered customer feedback analyzer that identifies feature requests...",
    color: "purple"
  },
  {
    icon: Heart,
    title: "Personal Growth Journey",
    description: "Someone documenting their recovery, mental health insights, and healing process",
    tags: ["Mental Health", "Recovery", "Self-Discovery"],
    contentExample: "Today I realized that my creative blocks stem from fear of vulnerability...",
    color: "pink"
  },
  {
    icon: Lightbulb,
    title: "Research & Innovation Hub",
    description: "A researcher connecting papers, experiments, and breakthrough moments",
    tags: ["Academic Research", "Innovation", "Knowledge Synthesis"],
    contentExample: "Connection found: The protein folding pattern in study X mirrors the algorithm from...",
    color: "yellow"
  },
  {
    icon: Music,
    title: "Artist's Creative Process",
    description: "A musician capturing lyrics, melodies, and creative inspirations",
    tags: ["Music Creation", "Artistic Process", "Creative Flow"],
    contentExample: "Melody idea: Minor progression that captures the feeling of autumn rain...",
    color: "green"
  },
  {
    icon: Code,
    title: "Developer's Knowledge Base",
    description: "A programmer saving code snippets, debugging solutions, and architecture patterns",
    tags: ["Programming", "Architecture", "Problem Solving"],
    contentExample: "Solved: React re-rendering issue was caused by unstable object reference in...",
    color: "indigo"
  },
  {
    icon: ChefHat,
    title: "Culinary Experiments",
    description: "A chef documenting recipes, flavor combinations, and kitchen innovations",
    tags: ["Cooking", "Recipe Development", "Food Science"],
    contentExample: "Discovery: Adding miso paste to chocolate chip cookies creates umami depth...",
    color: "orange"
  },
  {
    icon: Dumbbell,
    title: "Fitness & Wellness Tracker",
    description: "An athlete logging workouts, nutrition insights, and performance breakthroughs",
    tags: ["Fitness", "Nutrition", "Performance"],
    contentExample: "Breakthrough: Switching to morning workouts increased energy levels by 40%...",
    color: "red"
  }
]

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  pink: "bg-pink-100 text-pink-600",
  yellow: "bg-yellow-100 text-yellow-600",
  green: "bg-green-100 text-green-600",
  indigo: "bg-indigo-100 text-indigo-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600"
}

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Real-World Examples
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how different people use ScatterBrain AI to capture thoughts, generate insights, 
            and create content in their unique voice.
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {examples.map((example, index) => {
            const Icon = example.icon
            const colorClass = colorClasses[example.color as keyof typeof colorClasses]
            
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{example.title}</h3>
                    <p className="text-gray-600">{example.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {example.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-2">Example Content:</p>
                  <p className="text-sm text-gray-700 italic">"{example.contentExample}"</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Use Cases Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-4">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Capture Your Thoughts</h3>
              <p className="text-gray-600">
                Add any content - from quick ideas to full articles. Text, URLs, or voice notes - 
                we capture it all.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-4">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analyzes & Learns</h3>
              <p className="text-gray-600">
                Our AI understands your content, identifies themes, and learns your unique voice 
                through our voice discovery process.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-4">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Authentic Content</h3>
              <p className="text-gray-600">
                Generate platform-optimized content that sounds like you. From tweets to YouTube 
                scripts, maintain your voice everywhere.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Start Building Your External Brain</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands who are already capturing, understanding, and sharing their thoughts with AI.
          </p>
          <a
            href="/app/create"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Try It Free
          </a>
        </div>
      </main>
      
      {/* Footer component to be added */}
    </div>
  )
}