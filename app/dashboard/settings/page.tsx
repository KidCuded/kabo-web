// app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SettingsPage() {
  // Store Profile State
  const [storeName, setStoreName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [address, setAddress] = useState('')
  
  // Program Settings State
  const [stampThreshold, setStampThreshold] = useState<number | ''>(10)
  const [rewardDescription, setRewardDescription] = useState('')
  const [googleReviewUrl, setGoogleReviewUrl] = useState('') 
  const [reviewThreshold, setReviewThreshold] = useState<number>(4)
  
  // UI State
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data: businessData } = await supabase
          .from('businesses')
          .select('id, store_name, google_review_url, google_review_threshold, contact_number, address')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (businessData) {
          setStoreName(businessData.store_name)
          if (businessData.google_review_url) setGoogleReviewUrl(businessData.google_review_url)
          if (businessData.google_review_threshold) setReviewThreshold(businessData.google_review_threshold)
          if (businessData.contact_number) setContactNumber(businessData.contact_number)
          if (businessData.address) setAddress(businessData.address)

          const { data: ruleData } = await supabase
            .from('loyalty_rules')
            .select('stamp_threshold, reward_description')
            .eq('business_id', businessData.id)
            .single()

          if (ruleData) {
            setStampThreshold(ruleData.stamp_threshold)
            setRewardDescription(ruleData.reward_description)
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')

    if (Number(stampThreshold) < 1 || !rewardDescription.trim()) {
      setErrorMsg('Threshold must be at least 1, and reward description cannot be empty.')
      setIsSaving(false)
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()

      if (!businessData) throw new Error('Business not found')

      // 1. Save the Loyalty Rules
      const { error: upsertError } = await supabase
        .from('loyalty_rules')
        .upsert({
          business_id: businessData.id,
          stamp_threshold: Number(stampThreshold),
          reward_description: rewardDescription,
          updated_at: new Date().toISOString()
        }, { onConflict: 'business_id' })

      if (upsertError) throw new Error('Failed to update loyalty rules.')

      // 2. Save the Store Profile & Integrations
      const { error: businessUpdateError } = await supabase
        .from('businesses')
        .update({ 
          google_review_url: googleReviewUrl,
          google_review_threshold: reviewThreshold,
          contact_number: contactNumber,
          address: address
        })
        .eq('id', businessData.id)

      if (businessUpdateError) throw new Error('Failed to save store profile.')

      setToastMessage('Settings Saved Successfully!')
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Store Settings</h2>
          <p className="text-gray-500 mt-2">Manage your business profile and loyalty program rules.</p>
        </div>
        
        {errorMsg && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-500 animate-pulse font-medium">Loading settings...</div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* --- CARD 1: STORE PROFILE --- */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Store Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Store Name</label>
                  <input
                    type="text"
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 cursor-not-allowed"
                    value={storeName}
                  />
                  <p className="text-xs text-gray-400 mt-2">Store name cannot be changed currently. Contact support if needed.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="e.g., 03-12345678"
                    className="w-full md:w-1/2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Physical Address</label>
                  <textarea
                    rows={3}
                    placeholder="Enter the store's full address..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-colors"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* --- CARD 2: LOYALTY RULES --- */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">Loyalty Program Rules</h3>
                <p className="text-sm text-gray-500 mt-1">Configure how customers earn and redeem rewards.</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Stamps Required for Reward</label>
                  <select
                    required
                    className="w-full md:w-1/3 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors bg-white cursor-pointer"
                    value={stampThreshold}
                    onChange={(e) => setStampThreshold(Number(e.target.value))}
                  >
                    <option value={5}>5 Stamps</option>
                    <option value={6}>6 Stamps</option>
                    <option value={8}>8 Stamps</option>
                    <option value={10}>10 Stamps</option>
                    <option value={12}>12 Stamps</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">Select the total number of stamps required to complete a loyalty pass.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Reward Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Free Medium Latte"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    value={rewardDescription}
                    onChange={(e) => setRewardDescription(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">Clearly state what the customer receives upon redemption.</p>
                </div>
              </div>
            </section>
            {/* --- CARD 3: INTEGRATIONS --- */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                <h3 className="text-xl font-bold text-gray-900">Google Reviews</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Review Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://g.page/r/..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">When a customer redeems a reward, they will be prompted to leave a review using this link.</p>
                </div>
                
                {/* NEW THRESHOLD SELECTOR */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Review Redirection Threshold</label>
                  <select
                    className="w-full md:w-1/2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors bg-white"
                    value={reviewThreshold}
                    onChange={(e) => setReviewThreshold(Number(e.target.value))}
                  >
                    <option value={5}>5 Stars Only</option>
                    <option value={4}>4 Stars and up</option>
                    <option value={3}>3 Stars and up</option>
                    <option value={2}>2 Stars and up</option>
                    <option value={1}>1 Star and up (Always Redirect)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">Ratings below this threshold will redirect to a private feedback form instead of your public Google link.</p>
                </div>
              </div>
            </section>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}