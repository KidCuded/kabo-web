// app/dashboard/layout.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { startFreeTrial } from '@/app/actions/subscription'
import { logout } from './actions' // 1. Import the action

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

  if (!business) redirect('/') // Go back to onboarding/registration


  // --- LOCK SCREEN: TRIAL EXPIRED ---
  // Block merchants if their time is up!
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
            We hope you enjoyed using KABO. Upgrade to a Pro plan to unlock your dashboard and keep rewarding your customers.
          </p>
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-sm mb-3">
            Upgrade to Pro (RM 124/mo)
          </button>
          <p className="text-xs text-gray-400">Secure FPX Direct Debit via Curlec</p>
        </div>
      </div>
    )
  }

  // --- PREPARE THE TRIAL ACTION ---
  const startTrialWithId = startFreeTrial.bind(null, business.id)
  const isInactive = business.subscription_status === 'inactive'    

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