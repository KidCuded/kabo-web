'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/85 backdrop-blur-md border-b border-sky-100 shadow-xs shadow-sky-100/40"
        : "bg-white/60 backdrop-blur-xs border-b border-sky-100"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-black text-lg leading-none">K</span>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-sky-600 transition-all transform group-hover:translate-x-2 duration-300">
              KABO
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/about"
            className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors hidden sm:inline-block cursor-pointer"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors hidden sm:inline-block cursor-pointer"
          >
            Contact
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors cursor-pointer"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 transition-all duration-200 cursor-pointer"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}
