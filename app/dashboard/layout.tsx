// app/dashboard/layout.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { startFreeTrial } from '@/app/actions/subscription'
import { logout } from './actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('auth_user_id', userData.user.id)
    .single()

  if (!business) {
    redirect('/onboarding')
  }

  // --- LOCK SCREEN: TRIAL EXPIRED ---
  const isTrialExpired = 
    business.subscription_status === 'trialing' && 
    business.trial_ends_at && 
    new Date() > new Date(business.trial_ends_at)

  if (isTrialExpired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your trial has ended</h2>
          <p className="text-gray-500 mb-8">
            We hope you enjoyed using KABO. Upgrade to Pro plan to unlock your store and keep rewarding your customers.
          </p>
          <Link href="/dashboard" className="w-full text-lg font-bold bg-blue-500 text-white px-4 py-4 rounded-xl hover:bg-blue-400">
              Go to Dashboard
          </Link>
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-sm my-2">
            Upgrade to Pro (RM 111/mo)
          </button>
          <p className="text-xs text-gray-400">Secure FPX Direct Debit via Curlec</p>
        </div>
      </div>
    )
  }

  const startTrialWithId = startFreeTrial.bind(null, business.id)
  const isInactive = business.subscription_status === 'inactive'    

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      
      {/* --- MOBILE TOP BAR --- */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white font-black text-lg leading-none">K</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">KABO</h1>
        </div>
        <label htmlFor="mobile-sidebar" className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </label>
      </header>

      {/* --- THE PURE CSS STATE MANAGER --- */}
      <input type="checkbox" id="mobile-sidebar" className="peer hidden" />

      {/* --- MOBILE OVERLAY --- */}
      <label htmlFor="mobile-sidebar" className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 hidden peer-checked:block md:!hidden cursor-pointer"></label>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="fixed inset-y-0 left-0 transform -translate-x-full peer-checked:translate-x-0 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-72 md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 z-50 shadow-2xl md:shadow-none">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">KABO</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">POS Counter</p>
          </div>
          
          {/* Mobile Close Button */}
          <label htmlFor="mobile-sidebar" className="md:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg cursor-pointer transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </label>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Wrapping links in labels auto-closes the drawer on mobile without JS */}
          <Link href="/dashboard" className="block w-full">
            <label htmlFor="mobile-sidebar" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer">
              Counter
            </label>
          </Link>
          <Link href="/dashboard/analytics" className="block w-full">
            <label htmlFor="mobile-sidebar" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer">
              Analytics
            </label>
          </Link>
          <Link href="/dashboard/feedback" className="block w-full">
            <label htmlFor="mobile-sidebar" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer">
              Feedback
            </label>
          </Link>
          <Link href="/dashboard/settings" className="block w-full">
            <label htmlFor="mobile-sidebar" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer">
              Settings
            </label>
          </Link>
          <Link href="/dashboard/qr-code" className="block w-full">
            <label htmlFor="mobile-sidebar" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer">
              QR Code
            </label>
          </Link>
          <Link href="/dashboard/subscription" className="block w-full">
            <label htmlFor="mobile-sidebar" className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors cursor-pointer">
              Subscription
            </label>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
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

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full overflow-y-auto relative p-4 md:p-10">
        {children}
      </main>

    </div>
  )
}