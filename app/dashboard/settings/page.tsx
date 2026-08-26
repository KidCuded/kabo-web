// app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SettingsPage() {
  const [stampThreshold, setStampThreshold] = useState<number | ''>(10)
  const [rewardDescription, setRewardDescription] = useState('')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createClient()

  // Fetch Current Settings on Load
  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data: businessData } = await supabase
          .from('businesses')
          .select('id')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (businessData) {
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

  // Save Settings Logic
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

      // Use upsert to update if it exists, or insert if it's the merchant's first time saving
      const { error: upsertError } = await supabase
        .from('loyalty_rules')
        .upsert({
          business_id: businessData.id,
          stamp_threshold: Number(stampThreshold),
          reward_description: rewardDescription,
          updated_at: new Date().toISOString()
        }, { onConflict: 'business_id' })

      if (upsertError) throw new Error('Failed to update settings. Please try again.')

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
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Program Settings</h2>
          
          {errorMsg && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="text-gray-500 animate-pulse">Loading settings...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Stamp Threshold Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Stamps Required for Reward
                  </label>
                  <p className="text-sm text-gray-500 mb-3">How many stamps does a customer need to collect before redeeming a reward?</p>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full md:w-1/3 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={stampThreshold}
                    onChange={(e) => setStampThreshold(Number(e.target.value))}
                  />
                </div>

                <hr className="border-gray-100" />

                {/* Reward Description Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Reward Description
                  </label>
                  <p className="text-sm text-gray-500 mb-3">What will the customer receive? (e.g., "Free Coffee", "20% Off Next Purchase")</p>
                  <input
                    type="text"
                    required
                    placeholder="Enter reward details..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={rewardDescription}
                    onChange={(e) => setRewardDescription(e.target.value)}
                  />
                </div>

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