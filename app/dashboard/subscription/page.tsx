// app/dashboard/subscription/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SubscriptionPage() {
  const [status, setStatus] = useState<string>('loading')
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [daysLeft, setDaysLeft] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const supabase = createClient()
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('payment')

  useEffect(() => {
    if (paymentStatus === 'success') {
      alert("Payment successful! Your account is now Pro.")
    } else if (paymentStatus === 'failed') {
      alert("Payment failed or was cancelled.")
    }
  }, [paymentStatus])

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

  const startTrial = async () => {
    setIsStartingTrial(true)
    
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

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

  const handleChipCheckout = async () => {
    setIsLoading(true)
    
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data: business } = await supabase
        .from('businesses')
        .select('id, store_name')
        .eq('auth_user_id', userData.user.id)
        .single()

      if (!business) throw new Error('Business record not found')

      const response = await fetch('/api/chip/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          customerEmail: userData.user.email,
          customerName: business.store_name
        })
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to initiate CHIP checkout')

      if (data.checkoutUrl) {
        // Redirect user directly to CHIP's hosted payment page
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received from gateway')
      }

    } catch (error: any) {
      console.error('Checkout failed:', error)
      alert(error.message || 'Failed to initiate checkout. Please try again.')
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel your subscription? Your store will remain active until the end of your current billing cycle, after which it will be deactivated."
    )
    if (!confirmCancel) return

    setIsCancelling(true)
    try {
      const response = await fetch('/api/chip/cancel', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setStatus('cancelled')
      alert('Your subscription has been cancelled.')
    } catch (error: any) {
      console.error('Cancellation failed:', error)
      alert(error.message || 'Failed to cancel subscription. Please contact support.')
    } finally {
      setIsCancelling(false)
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
                <p className="text-gray-600 mb-6">Your account is active and billing automatically via CHIP.</p>
                
                <button
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {isCancelling ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            )}

            {status === 'cancelled' && (
              <div>
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  Cancelled
                </div>
                <p className="text-gray-600 mb-6">Your subscription has been cancelled. You will not be billed again, and your portal will deactivate at the end of the billing cycle.</p>
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
            onClick={handleChipCheckout}
            disabled={isLoading || status === 'active'}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Redirecting to CHIP...' : status === 'active' ? 'You are on Pro' : 'Pay with CHIP (FPX & Cards)'}
          </button>
          <p className="text-xs text-center text-gray-400 mt-4">Secure payment processing by CHIP Asia</p>
        </div>

      </div>
    </div>
  )
}