// app/dashboard/subscription/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SubscriptionPage() {
  const [status, setStatus] = useState<string>('loading')
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [daysLeft, setDaysLeft] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isStartingTrial, setIsStartingTrial] = useState(false) // New loading state for the trial button

  const supabase = createClient()

  useEffect(() => {
    async function fetchSubscription() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: business } = await supabase
        .from('businesses')
        .select('subscription_status, trial_ends_at')
        .eq('auth_user_id', userData.user.id)
        .single()

      if (business) {
        setStatus(business.subscription_status || 'inactive')
        
        if (business.trial_ends_at) {
          const endDate = new Date(business.trial_ends_at)
          setTrialEndsAt(endDate)
          
          const diffTime = endDate.getTime() - new Date().getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          setDaysLeft(diffDays > 0 ? diffDays : 0)
        }
      }
    }
    fetchSubscription()
  }, [])

  // Start Trial Function
  // This function will be called when the user clicks the "Start Trial" button.
  // It updates the subscription status to 'trialing' and sets the trial end date to 14 days from now.
  const startTrial = async () => {
    setIsStartingTrial(true)
    
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      // Calculate the date 14 days from now
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 14)

      const { error } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'trialing',
          trial_ends_at: endDate.toISOString()
        })
        .eq('auth_user_id', userData.user.id)

      if (error) throw error

      // Update local state to reflect the new trial status immediately
      setStatus('trialing')
      setTrialEndsAt(endDate)
      setDaysLeft(14)
      
    } catch (error) {
      console.error('Failed to start trial:', error)
      alert('Failed to start your trial. Please try again or contact support.')
    } finally {
      setIsStartingTrial(false)
    }
  }

  const handleCurlecCheckout = async () => {
    setIsLoading(true)
    
    try {
      // 1. Fetch the subscription ID from your Next.js route
      const response = await fetch('/api/curlec/checkout', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)

      // 2. Load the Curlec/Razorpay checkout script dynamically
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        
        // 3. Configure the checkout modal
        const options = {
          // Public Key ID for initializing the inline checkout UI
          key: process.env.NEXT_PUBLIC_CURLEC_KEY_ID, 
          subscription_id: data.subscriptionId,
          name: 'KABO Pro',
          description: 'Monthly Subscription via FPX',
          theme: {
            color: '#2563EB',
          },
          handler: function (response: any) {
            alert('Payment mandate authorized successfully!')
          },
        }

        // 4. Open the modal
        const paymentObject = new (window as any).Razorpay(options)
        paymentObject.open()
        setIsLoading(false)
      }
      
      document.body.appendChild(script)

    } catch (error) {
      console.error('Checkout failed:', error)
      alert('Failed to initiate checkout. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h2>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* --- CURRENT STATUS CARD --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">Current Plan</h3>
          
          <div className="flex-1">
            {status === 'loading' && (
              <p className="text-gray-500 animate-pulse">Checking status...</p>
            )}

            {status === 'trialing' && (
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                  Active Trial
                </div>
                <p className="text-gray-600 mb-2">You are currently exploring KABO on a free trial.</p>
                <p className="text-3xl font-black text-gray-900 mb-1">{daysLeft} Days</p>
                <p className="text-sm text-gray-500">Remaining until {trialEndsAt?.toLocaleDateString()}</p>
              </div>
            )}

            {status === 'inactive' && (
              <div>
                <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                  Setup Mode
                </div>
                <p className="text-gray-600 mb-6">Your store is not yet active. Start your 14-day free trial to unlock all features.</p>
                {/* 1. NEW BUTTON TO START TRIAL */}
                <button
                  onClick={startTrial}
                  disabled={isStartingTrial}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isStartingTrial ? 'Starting Trial...' : 'Start 14-Day Free Trial'}
                </button>
              </div>
            )}

            {status === 'active' && (
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Pro Plan (Active)
                </div>
                <p className="text-gray-600">Your account is active and billing automatically via Curlec.</p>
              </div>
            )}
          </div>
        </div>

        {/* --- UPGRADE / CHECKOUT CARD --- */}
        <div className="bg-gray-900 rounded-xl shadow-md border border-gray-800 p-8 text-white flex flex-col">
          <h3 className="text-lg font-bold text-gray-100 mb-6 border-b border-gray-700 pb-2">Upgrade to Pro</h3>
          
          <div className="flex-1">
            <div className="mb-6">
              <span className="text-4xl font-black">RM 150</span>
              <span className="text-gray-400"> / month</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Unlimited customer registrations
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Digital QR code scanner
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Google Review redirection
              </li>
            </ul>
          </div>

          <button
            onClick={handleCurlecCheckout}
            disabled={isLoading || status === 'active'}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting to Curlec...' : status === 'active' ? 'You are on Pro' : 'Setup Auto-Debit (FPX)'}
          </button>
          <p className="text-xs text-center text-gray-400 mt-4">Secure payment processing by Curlec</p>
        </div>

      </div>
    </div>
  )
}