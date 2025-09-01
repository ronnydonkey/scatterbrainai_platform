'use client'

import { motion } from 'framer-motion'
import { Brain, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-2 mb-8 bg-blue-50 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">7-day free trial • No credit card required</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn your scattered thoughts<br />
            into compelling social content
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Stop losing brilliant ideas in the chaos. ScatterBrainAI captures every fleeting thought 
            and transforms them into polished content that resonates with your audience.
          </p>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/app/create"
              className="inline-flex items-center bg-blue-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Brain className="w-6 h-6 mr-2" />
              Create Your Brain
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
          
          <p className="mt-4 text-sm text-gray-500">
            Free for 7 days • Export your data anytime • Cancel instantly
          </p>
        </motion.div>
      </div>
    </section>
  )
}