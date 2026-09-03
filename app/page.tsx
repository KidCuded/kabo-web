// app/page.tsx
import Link from 'next/link'
import Header from './header'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-blue-500/30">
      
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
            Drive retention. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Skyrocket your reputation.
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
            A lightning-fast digital platform that keeps customers coming back for rewards, catches negative feedback privately, and automatically drives your best customers to leave 5-star Google Reviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto text-lg font-bold bg-blue-500 text-white px-8 py-4 rounded-xl hover:bg-blue-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
              Start Your Free Store
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gray-950 py-24 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
              
              {/* Feature 1: Checkout */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Lightning Fast Checkout</h3>
                <p className="text-gray-400 leading-relaxed">Search by phone number and add stamps in one click. Never slow down your checkout line waiting for customers to find an app.</p>
              </div>

              {/* Feature 2: Reputation Management */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Reputation Builder</h3>
                <p className="text-gray-400 leading-relaxed">Intercept negative feedback privately to resolve issues, while automatically funneling your happiest customers directly to Google Reviews.</p>
              </div>

              {/* Feature 3: Analytics */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Actionable Analytics</h3>
                <p className="text-gray-400 leading-relaxed">Know exactly how many stamps you've issued, your daily redemption rates, and how many new customers are joining your program.</p>
              </div>

              {/* Feature 4: No App */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Frictionless for Customers</h3>
                <p className="text-gray-400 leading-relaxed">No apps to download. Customers simply scan a QR code on your counter to instantly view their digital stamp card in their phone's browser.</p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-black border-t border-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm font-medium">
            © {new Date().getFullYear()} KABO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}