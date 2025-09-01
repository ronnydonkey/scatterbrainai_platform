'use client'

import { motion } from 'framer-motion'
import { Star, Users, Brain, TrendingUp } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "SC",
    content: "I went from spending hours crafting posts to having publication-ready content in minutes. My engagement has tripled since using ScatterBrainAI.",
    metric: "3x engagement"
  },
  {
    name: "Marcus Johnson",
    role: "Startup Founder",
    avatar: "MJ",
    content: "Finally, a tool that captures my ADHD brain's rapid-fire ideas and turns them into coherent thought leadership content. Game changer.",
    metric: "5 hours/week saved"
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Director",
    avatar: "ER",
    content: "The AI doesn't just rewrite—it understands the essence of my thoughts and adapts them perfectly for each platform. It's like having a content team in my pocket.",
    metric: "10x content output"
  }
]

const stats = [
  { icon: Users, value: "5,000+", label: "Active Brains" },
  { icon: Brain, value: "1M+", label: "Thoughts Captured" },
  { icon: TrendingUp, value: "250%", label: "Avg. Engagement Increase" }
]

export function SocialProof() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by creators who think differently
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands turning scattered brilliance into structured success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-3">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">{testimonial.content}</p>
              <div className="text-sm font-semibold text-blue-600">
                {testimonial.metric}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-8 py-8 border-t border-b border-gray-200"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}