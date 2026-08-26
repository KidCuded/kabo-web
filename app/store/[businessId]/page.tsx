// app/store/[businessId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function CustomerCheckPage() {
  // Grab the specific store ID from the URL
  const params = useParams()
  const businessId = params.businessId as string

  // Store Info State
  const [storeName, setStoreName] = useState('Loading Store...')
  const [threshold, setThreshold] = useState(10)
  const [rewardDesc, setRewardDesc] = useState('Reward')

  // Customer State
  const [phoneNumber, setPhoneNumber] = useState('')
  const [searchState, setSearchState] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND'>('IDLE')
  const [customer, setCustomer] = useState<{ name: string; stamps: number } | null>(null)

  const supabase = createClient()

  // 1. Fetch Store Details on Load
  useEffect(() => {
    async function fetchStoreDetails() {
      if (!businessId) return

      // Fetch the business name
      const { data: bData } = await supabase
        .from('businesses')
        .select('store_name')
        .eq('id', businessId)
        .single()
      
      if (bData) setStoreName(bData.store_name)

      // Fetch the store's rules
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

  // 2. Handle Customer Lookup
  const handleCheckStamps = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return

    setSearchState('LOADING')

    // Find the customer
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id, name')
      .eq('phone_number', phoneNumber)
      .eq('business_id', businessId)
      .single()

    if (customerError || !customerData) {
      setSearchState('NOT_FOUND')
      return
    }

    // Find their balance for THIS store
    const { data: balanceData } = await supabase
      .from('loyalty_balances')
      .select('current_stamps')
      .eq('customer_id', customerData.id)
      .eq('business_id', businessId)
      .single()

    setCustomer({
      name: customerData.name || 'Valued Customer',
      stamps: balanceData?.current_stamps || 0
    })

    setSearchState('FOUND')
  }

  // 3. Reset to check another number
  const resetSearch = () => {
    setSearchState('IDLE')
    setPhoneNumber('')
    setCustomer(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{storeName}</h1>
        <p className="text-gray-500 mt-2 font-medium">Customer Loyalty Portal</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        
        {/* IDLE / LOADING / NOT FOUND STATES */}
        {searchState !== 'FOUND' && (
          <form onSubmit={handleCheckStamps} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Check Your Stamps</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your phone number to see your progress toward your next reward.</p>
            </div>

            <div>
              <input
                type="tel"
                required
                placeholder="e.g., 0123456789"
                className="w-full text-center text-xl tracking-wider rounded-xl border border-gray-300 px-4 py-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

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
        )}

        {/* FOUND STATE: Visual Stamp Card */}
        {searchState === 'FOUND' && customer && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {customer.name}!</h2>
            <p className="text-gray-500 mt-1 font-medium">{customer.stamps} / {threshold} Stamps Collected</p>
            
            {/* The Visual Stamp Grid */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 mb-8">
              {Array.from({ length: threshold }).map((_, index) => {
                const isStamped = index < customer.stamps;
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

            {/* Reward Status */}
            {customer.stamps >= threshold ? (
              <div className="bg-green-50 border border-green-200 text-green-700 py-4 px-6 rounded-xl font-bold text-lg mb-6">
                🎉 You earned: {rewardDesc}!
              </div>
            ) : (
              <div className="bg-blue-50 text-blue-700 py-3 px-4 rounded-xl font-medium text-sm mb-6">
                Only {threshold - customer.stamps} more stamps to unlock: {rewardDesc}
              </div>
            )}

            <button 
              onClick={resetSearch}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Check a different number
            </button>
          </div>
        )}

      </div>
    </div>
  )
}