// app/page.tsx
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl leading-none">K</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">KABO</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-6">
            Ditch the paper <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              punch cards.
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto font-medium mb-10">
            A lightning-fast, digital loyalty system for modern businesses. Reward your customers, track your growth, and keep them coming back—no app download required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto text-lg font-semibold bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-500 transition-all shadow-md hover:shadow-lg">
              Start Your Free Store
            </Link>
            <Link href="/store/demo" className="w-full sm:w-auto text-lg font-semibold bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              Try Customer View
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white py-20 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {/* Feature 1 */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast Checkout</h3>
                <p className="text-gray-500 leading-relaxed">Search by phone number and add stamps in one click. Never slow down your checkout line.</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Actionable Analytics</h3>
                <p className="text-gray-500 leading-relaxed">Know exactly how many stamps you've issued and how many rewards your best customers have claimed.</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No App Required</h3>
                <p className="text-gray-500 leading-relaxed">Customers scan a QR code on your counter to instantly view their digital stamp card right in their browser.</p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} KABO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}