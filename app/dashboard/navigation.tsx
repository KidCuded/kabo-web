// app/dashboard/navigation.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from './actions'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Automatically close the mobile sidebar whenever the URL changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Helper function to apply active styles to the current tab
  const getLinkClass = (path: string) => {
    const isActive = pathname === path
    return `block px-4 py-3 rounded-lg font-medium transition-colors ${
      isActive 
        ? 'bg-slate-700 text-white' 
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`
  }

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <header className="md:hidden bg-slate-800 border-b border-slate-700 px-4 py-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-black text-lg leading-none">K</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">KABO</h1>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </header>

      {/* --- MOBILE OVERLAY --- */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden cursor-pointer"
        />
      )}

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-72 md:w-64 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 z-50 shadow-2xl md:shadow-none`}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">KABO</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">POS Counter</p>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 -mr-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className={getLinkClass('/dashboard')}>Counter</Link>
          <Link href="/dashboard/analytics" className={getLinkClass('/dashboard/analytics')}>Analytics</Link>
          <Link href="/dashboard/feedback" className={getLinkClass('/dashboard/feedback')}>Feedback</Link>
          <Link href="/dashboard/customers" className={getLinkClass('/dashboard/customers')}>Customers</Link>
          <Link href="/dashboard/settings" className={getLinkClass('/dashboard/settings')}>Settings</Link>
          <Link href="/dashboard/customization" className={getLinkClass('/dashboard/customization')}>Customization</Link>
          <Link href="/dashboard/qr-code" className={getLinkClass('/dashboard/qr-code')}>QR Code</Link>
          <Link href="/dashboard/subscription" className={getLinkClass('/dashboard/subscription')}>Subscription</Link>
        </nav>
        
        <div className="p-4 border-t border-slate-700">
          <form action={logout}>
            <button 
              type="submit" 
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-red-400 hover:bg-slate-700 hover:text-red-300 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}