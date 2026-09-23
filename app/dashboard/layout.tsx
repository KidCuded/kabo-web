// app/dashboard/layout.tsx
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { startFreeTrial } from '@/app/actions/subscription'
import Navigation from './navigation' // Import your new client component

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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden">
      
      {/* Clean separation: Navigation handles all client-side logic and UI */}
      <Navigation />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full overflow-y-auto relative p-4 md:p-10 bg-gray-50">
        {children}
      </main>

    </div>
  )
}