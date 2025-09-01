'use client'

import Link from 'next/link'
import { Brain } from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 10)
    })
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">ScatterBrainAI</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/examples" className="text-gray-600 hover:text-gray-900 transition">
              Examples
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition">
              About
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition">
              Blog
            </Link>
            <Link 
              href="/app" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}