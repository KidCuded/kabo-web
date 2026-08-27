// app/dashboard/layout.tsx
import Link from 'next/link'
import { logout } from './actions' // 1. Import the action

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-20 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">KABO</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">POS Counter</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
            Counter
          </Link>
          <Link href="/dashboard/analytics" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
            Analytics
          </Link>
          <Link href="/dashboard/feedback" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
            Feedback
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
            Settings
          </Link>
          <Link href="/dashboard/qr-code" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors">
            QR Code
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          {/* 2. Wrap the button in a form pointing to the action */}
          <form action={logout}>
            <button 
              type="submit" 
              className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative p-6 md:p-10">
        {children}
      </main>

    </div>
  )
}