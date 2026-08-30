// app/store/[businessId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function CustomerCheckPage() {
  const params = useParams()
  const businessId = params.businessId as string

  // Store Info State
  const [storeName, setStoreName] = useState('Loading Store...')
  const [threshold, setThreshold] = useState(10)
  const [rewardDesc, setRewardDesc] = useState('Reward')
  const [reviewUrl, setReviewUrl] = useState('')
  
  // NEW: Track if the store is allowed to process customers
  const [storeStatus, setStoreStatus] = useState<'LOADING' | 'INACTIVE' | 'ACTIVE'>('LOADING')

  // Customer Loyalty State
  const [phoneNumber, setPhoneNumber] = useState('')
  const [searchState, setSearchState] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND'>('IDLE')
  const [customer, setCustomer] = useState<{ name: string; stamps: number } | null>(null)

  // Feedback State
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackStep, setFeedbackStep] = useState<'IDLE' | 'ASK_TEXT' | 'SHOW_GOOGLE' | 'SUBMITTED'>('IDLE')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStoreDetails() {
      if (!businessId) return

      // Fetch subscription_status along with the other details
      const { data: bData } = await supabase
        .from('businesses')
        .select('store_name, google_review_url, subscription_status')
        .eq('id', businessId)
        .single()
      
      if (bData) {
        setStoreName(bData.store_name)
        if (bData.google_review_url) setReviewUrl(bData.google_review_url)
        
        // Lock the page if they are still in setup mode
        setStoreStatus(bData.subscription_status === 'inactive' ? 'INACTIVE' : 'ACTIVE')
      }

      const { data: rData } = await supabase
        .from('loyalty_rules')
        .select('stamp_threshold, reward_description')
        .eq('business_id', businessId)
        .single()

      if (rData) {
        setThreshold(rData.stamp_threshold)
        setRewardDesc(rData.reward_description)
      }
    }
    fetchStoreDetails()
  }, [businessId])

  const handleCheckStamps = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return

    setSearchState('LOADING')

    // Inner join customers and loyalty_balances for THIS specific business
    const { data, error } = await supabase
      .from('customers')
      .select(`
        id, 
        name, 
        loyalty_balances!inner ( current_stamps )
      `)
      .eq('phone_number', phoneNumber)
      .eq('loyalty_balances.business_id', businessId)
      .maybeSingle() // <--- Use maybeSingle() instead of single() to prevent crashes on duplicates

    if (error || !data) {
      setSearchState('NOT_FOUND')
      return
    }

    const balances = Array.isArray(data.loyalty_balances) 
      ? data.loyalty_balances[0] 
      : data.loyalty_balances

    setCustomer({
      name: data.name || 'Valued Customer',
      stamps: balances?.current_stamps || 0
    })

    setSearchState('FOUND')
  }
  const resetSearch = () => {
    setSearchState('IDLE')
    setPhoneNumber('')
    setCustomer(null)
  }

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating)
    if (selectedRating >= 4) {
      setFeedbackStep('SHOW_GOOGLE')
      submitToDatabase(selectedRating, '') 
    } else {
      setFeedbackStep('ASK_TEXT')
    }
  }

  const submitToDatabase = async (finalRating: number, text: string) => {
    await supabase.from('reviews').insert([{
      business_id: businessId,
      rating: finalRating,
      comment: text
    }])
  }

  const handleTextSubmit = async () => {
    setIsSubmitting(true)
    await submitToDatabase(rating, feedbackText)
    setFeedbackStep('SUBMITTED')
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 pb-24">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{storeName}</h1>
        <p className="text-gray-500 mt-2 font-medium">Customer Loyalty Portal</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        
        {/* THE NEW LOCK SCREEN */}
        {storeStatus === 'INACTIVE' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Program Inactive</h2>
            <p className="text-sm text-gray-500">This store is currently setting up their loyalty program. Please check back later!</p>
          </div>
        ) : storeStatus === 'ACTIVE' ? (
          <>
            {/* --- LOYALTY LOOKUP CARD --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {searchState !== 'FOUND' ? (
                <form onSubmit={handleCheckStamps} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Check Your Stamps</h2>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number (e.g., 0123456789)"
                    className="w-full text-center text-xl tracking-wider rounded-xl border border-gray-300 px-4 py-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {searchState === 'NOT_FOUND' && (
                    <div className="text-red-600 text-sm text-center font-medium bg-red-50 py-3 rounded-lg">
                      No profile found for this number at this store.
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={searchState === 'LOADING'}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50"
                  >
                    {searchState === 'LOADING' ? 'Looking up...' : 'Check Balance'}
                  </button>
                </form>
              ) : (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome back, {customer?.name}!</h2>
                  <p className="text-gray-500 mt-1 font-medium">{customer?.stamps} / {threshold} Stamps Collected</p>
                  
                  <div className="flex flex-wrap justify-center gap-3 mt-8 mb-8">
                    {Array.from({ length: threshold }).map((_, index) => {
                      const isStamped = customer && index < customer.stamps;
                      return (
                        <div 
                          key={index} 
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm transition-all duration-500 ${
                            isStamped 
                              ? 'bg-blue-600 text-white scale-110 shadow-blue-200' 
                              : 'bg-gray-100 text-gray-300 border-2 border-dashed border-gray-200'
                          }`}
                        >
                          {isStamped ? '★' : ''}
                        </div>
                      )
                    })}
                  </div>

                  {customer && customer.stamps >= threshold ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 py-4 px-6 rounded-xl font-bold text-lg mb-6 shadow-sm">
                      🎉 You earned: {rewardDesc}!
                    </div>
                  ) : (
                    <div className="bg-blue-50 text-blue-700 py-3 px-4 rounded-xl font-medium text-sm mb-6">
                      Only {customer ? threshold - customer.stamps : ''} more stamps to unlock: {rewardDesc}
                    </div>
                  )}
                  <button onClick={resetSearch} className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
                    Check a different number
                  </button>
                </div>
              )}
            </div>

            {/* --- REVIEW GATE CARD --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              
              {feedbackStep === 'IDLE' && (
                <div className="animate-in fade-in">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">How was your experience today?</h3>
                  <p className="text-sm text-gray-500 mb-6">Tap a star to rate {storeName}</p>
                  
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <svg 
                          className={`w-12 h-12 transition-colors duration-200 ${
                            star <= (hoveredRating || rating) ? 'text-amber-400' : 'text-gray-200'
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {feedbackStep === 'ASK_TEXT' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">We're sorry to hear that.</h3>
                  <p className="text-sm text-gray-500 mb-4">How can we improve your experience next time?</p>
                  <textarea
                    rows={4}
                    placeholder="Tell us what went wrong..."
                    className="w-full rounded-xl border border-gray-300 p-4 text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none mb-4"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={isSubmitting || !feedbackText.trim()}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </div>
              )}

              {feedbackStep === 'SHOW_GOOGLE' && (
                <div className="animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">That's wonderful!</h3>
                  <p className="text-sm text-gray-500 mb-6">As a local business, online reviews mean the world to us. Would you mind sharing your experience on Google?</p>
                  
                  {reviewUrl ? (
                    <a 
                      href={reviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold transition-colors w-full justify-center shadow-md shadow-blue-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                      Leave a Google Review
                    </a>
                  ) : (
                    <p className="text-green-600 font-bold bg-green-50 py-3 rounded-lg">Thank you for your rating!</p>
                  )}
                </div>
              )}

              {feedbackStep === 'SUBMITTED' && (
                <div className="animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Thank you!</h3>
                  <p className="text-gray-500">Your feedback has been sent directly to the store manager. We appreciate you helping us improve.</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}