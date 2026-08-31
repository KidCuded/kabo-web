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
          .select('id, store_name, google_review_url, contact_number, address')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (businessData) {
          setStoreName(businessData.store_name)
          if (businessData.google_review_url) setGoogleReviewUrl(businessData.google_review_url)
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
  }, [])

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

      // 2. Save the Store Profile & Google Review URL
      const { error: businessUpdateError } = await supabase
        .from('businesses')
        .update({ 
          google_review_url: googleReviewUrl,
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

      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
        
        {errorMsg && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-500 animate-pulse">Loading settings...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSaveSettings} className="space-y-8">
              
              {/* --- STORE PROFILE SECTION --- */}
              <section>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4 pb-2">
                  {storeName}
                </h2>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                  Store Profile
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g., 03-12345678"
                      className="w-full md:w-1/2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Physical Address
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter the store's full address..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* --- LOYALTY PROGRAM SECTION --- */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Loyalty Program</h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Stamps Required for Reward
                    </label>
                    <p className="text-sm text-gray-500 mb-3">How many stamps does a customer need to collect?</p>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full md:w-1/3 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={stampThreshold}
                      onChange={(e) => setStampThreshold(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Reward Description
                    </label>
                    <p className="text-sm text-gray-500 mb-3">What will the customer receive? (e.g., "Free Coffee")</p>
                    <input
                      type="text"
                      required
                      placeholder="Enter reward details..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      value={rewardDescription}
                      onChange={(e) => setRewardDescription(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* --- INTEGRATIONS SECTION --- */}
              <section className="bg-blue-50 -mx-8 px-8 py-6 border-y border-blue-100">
                <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                  Google Review Link (Optional)
                </label>
                <p className="text-sm text-blue-700 mb-3">Customers will be asked to leave a review when they earn a reward.</p>
                <input
                  type="url"
                  placeholder="https://g.page/r/..."
                  className="w-full rounded-lg border border-blue-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                />
              </section>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  )
}