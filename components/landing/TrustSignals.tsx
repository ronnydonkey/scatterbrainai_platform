'use client'

import { motion } from 'framer-motion'
import { Shield, Download, Clock, Lock } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: "Your thoughts, your data, your choice—always",
    description: "We believe your ideas belong to you. Export everything anytime, no questions asked."
  },
  {
    icon: Download,
    title: "Export your brain in any format",
    description: "Download your thoughts as text, JSON, or organized clusters. Your data is never locked in."
  },
  {
    icon: Clock,
    title: "Clear 7-day trial, easy opt-out",
    description: "Try everything free for a week. One click to pause or cancel—we'll keep your data safe for 30 days."
  },
  {
    icon: Lock,
    title: "Bank-level encryption",
    description: "Your thoughts are encrypted at rest and in transit. We can't read them, and neither can anyone else."
  }
]

export function TrustSignals() {
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
            Built on trust and transparency
          </h2>
          <p className="text-xl text-gray-600">
            Your cognitive infrastructure, your rules
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-8">
            Ready to organize your scattered brilliance?
          </p>
          <motion.a
            href="/app"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center bg-blue-600 text-white text-lg px-8 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Create Your Brain - Free for 7 Days
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}