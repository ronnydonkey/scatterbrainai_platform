'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { useState } from 'react'

const examples = [
  {
    input: "Just had a crazy idea - what if AI could actually understand context the way humans do? Like not just pattern matching but actual comprehension. Would change everything about how we build products.",
    outputs: {
      twitter: "🧠 What if AI could truly understand context like humans do?\n\nNot just pattern matching, but genuine comprehension.\n\nThis shift would revolutionize:\n• Product development\n• User experiences\n• Problem-solving approaches\n\nWe're closer than you think. 🚀 #AI #FutureTech",
      linkedin: "The next frontier in AI isn't just better pattern matching—it's genuine contextual understanding.\n\nImagine AI systems that grasp nuance, intention, and meaning the way humans do. This paradigm shift would fundamentally transform how we approach product development.\n\nInstead of building around AI limitations, we could design experiences that leverage true comprehension. The implications for customer service, education, and creative industries are profound.\n\nWhat aspects of your industry would change if AI truly understood context?",
      reddit: "Had this thought today: We keep improving AI's pattern matching, but what if we're approaching it wrong? What if the breakthrough comes from teaching AI actual contextual understanding—like how humans process meaning, not just data?\n\nThink about it: Current AI is incredibly powerful but it's still fundamentally playing a very sophisticated game of 'match the pattern.' True comprehension would be a complete game-changer for product development.\n\nWhat do you think—are we close to this breakthrough or still years away?"
    }
  }
]

export function TransformationDemo() {
  const [activeExample] = useState(0)
  const [activeOutput, setActiveOutput] = useState<'twitter' | 'linkedin' | 'reddit'>('twitter')
  
  const example = examples[activeExample]
  
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Watch your thoughts transform
          </h2>
          <p className="text-xl text-gray-600">
            From scattered ideas to platform-perfect content in seconds
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-gray-400 mr-2">Your raw thought</span>
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {example.input}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                AI-crafted content
              </h3>
              <div className="flex space-x-2">
                {(['twitter', 'linkedin', 'reddit'] as const).map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setActiveOutput(platform)}
                    className={`px-3 py-1 text-sm rounded-lg transition ${
                      activeOutput === platform
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {example.outputs[activeOutput]}
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <ArrowRight className="w-8 h-8 text-blue-600 mx-auto rotate-90 md:rotate-0" />
        </motion.div>
      </div>
    </section>
  )
}