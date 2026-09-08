// app/page.tsx
import Link from 'next/link'
import Header from './header'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans selection:bg-blue-500/30">
      
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 relative z-10">
            Drive retention. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Skyrocket your reputation.
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto font-medium mb-12 leading-relaxed relative z-10">
            A lightning-fast digital platform that keeps customers coming back for rewards, catches negative feedback privately, and automatically drives your best customers to leave 5-star Google Reviews.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link href="/register" className="w-full sm:w-auto text-lg font-bold bg-blue-500 text-white px-8 py-4 rounded-xl hover:bg-blue-400 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              Start Your Free Store
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto text-lg font-bold bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all border border-gray-800 hover:border-gray-700">
              View Pricing
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gray-950 py-24 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Feature 1: Checkout */}
              <div className="group bg-black border border-gray-900 rounded-3xl p-10 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Lightning Fast Checkout</h3>
                <p className="text-gray-400 leading-relaxed text-lg">Search by phone number and add stamps in one click. Never slow down your checkout line waiting for customers to find an app.</p>
              </div>

              {/* Feature 2: Reputation Management */}
              <div className="group bg-black border border-gray-900 rounded-3xl p-10 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Smart Reputation Builder</h3>
                <p className="text-gray-400 leading-relaxed text-lg">Intercept negative feedback privately to resolve issues, while automatically funneling your happiest customers directly to Google Reviews.</p>
              </div>

              {/* Feature 3: Analytics */}
              <div className="group bg-black border border-gray-900 rounded-3xl p-10 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Actionable Analytics</h3>
                <p className="text-gray-400 leading-relaxed text-lg">Know exactly how many stamps you've issued, your daily redemption rates, and how many new customers are joining your program.</p>
              </div>

              {/* Feature 4: No App */}
              <div className="group bg-black border border-gray-900 rounded-3xl p-10 hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Frictionless for Customers</h3>
                <p className="text-gray-400 leading-relaxed text-lg">No apps to download. Customers simply scan a QR code on your counter to instantly view their digital stamp card in their phone's browser.</p>
              </div>

            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="bg-black py-24 border-t border-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Simple, transparent pricing.</h2>
              <p className="text-xl text-gray-400">Everything you need to grow your store, for less than the cost of a daily coffee.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Free Trial Card */}
              <div className="bg-gray-950 border border-gray-800 rounded-3xl p-8 lg:p-10 hover:border-gray-700 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">Free Trial</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black text-white">RM 0</span>
                  <span className="text-gray-500">for 14 days</span>
                </div>
                <p className="text-gray-400 mb-8 h-12">Test the waters and see how KABO works for your store.</p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Full dashboard access
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Unlimited customer registrations
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Basic loyalty tracking
                  </li>
                </ul>
                <Link href="/register" className="block w-full text-center font-bold bg-gray-800 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition-colors">
                  Start Trial
                </Link>
              </div>

              {/* Pro Plan Card */}
              <div className="bg-gradient-to-b from-blue-900/20 to-black border border-blue-500/30 rounded-3xl p-8 lg:p-10 relative hover:border-blue-500/60 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">Most Popular</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black text-white">RM 111</span>
                  <span className="text-gray-400 font-medium">/ month</span>
                </div>
                <p className="text-blue-200/70 mb-8 h-12">The complete retention and reputation engine for modern stores.</p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 text-gray-200">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span className="font-semibold">Everything in Trial, plus:</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Smart Reputation Management
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Automated Google Review routing
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Digital QR code scanner support
                  </li>
                </ul>
                <Link href="/register" className="block w-full text-center font-bold bg-blue-500 text-white px-6 py-4 rounded-xl hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/25">
                  Upgrade to Pro
                </Link>
              </div>

            </div>
          </div>
        </div>
        
        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-t border-blue-900/50 py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to upgrade your store?</h2>
            <p className="text-xl text-blue-200/80 mb-8">Join modern stores using KABO to bring customers back.</p>
            <Link href="/register" className="inline-block font-bold bg-white text-black px-10 py-4 rounded-xl hover:bg-gray-200 transition-colors transform hover:-translate-y-1 shadow-xl">
              Get Started for Free
            </Link>
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