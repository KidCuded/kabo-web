'use client'

import Link from 'next/link'

import { useState, useEffect } from 'react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    // Check initial scroll position on page load
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "backdrop-blur-md bg-gray/80 border-b-[0.5px] border-gray-500/20 shadow-sm" // Shown when scrolled
          : "bg-transparent border-b border-gray-700/90" // Blended seamlessly when at top
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-white font-black text-xl leading-none">K</span>
                </div>
                <Link href="/" className="text-2xl font-black text-white tracking-tight transition-all duration-300 transform hover:translate-x-2 duration-300">
                    KABO
                </Link>
            </div>
            <nav className="flex items-center gap-6">
                <Link href="/auth/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                    Log in
                </Link>
                <Link href="/auth/register" className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors shadow-sm">
                    Get Started
                </Link>
            </nav>
        </div>
    </header>
  )
}