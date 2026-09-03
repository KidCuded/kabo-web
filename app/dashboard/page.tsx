// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [searchedPhone, setSearchedPhone] = useState('')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [stampThreshold, setStampThreshold] = useState<number>(10)
  const [searchState, setSearchState] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND' | 'REGISTERING'>('IDLE')
  
  const [customer, setCustomer] = useState<{ id: string; name: string; stamps: number; phone: string } | null>(null)
  const [stampsToAdd, setStampsToAdd] = useState<number>(1) // Controls the dynamic stamp counter
  
  // Registration & Toast State
  const [newCustomerName, setNewCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const supabase = createClient()

  // Fetch the business ID for the logged-in user
  useEffect(() => {
    async function fetchBusiness() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()

      if (businessData) {
        setBusinessId(businessData.id)
        
        const { data: ruleData } = await supabase
          .from('loyalty_rules')
          .select('stamp_threshold')
          .eq('business_id', businessData.id)
          .single()
          
        if (ruleData) {
          setStampThreshold(ruleData.stamp_threshold)
        }
      }
    }
    fetchBusiness()
  }, [])

  // 1. Search Logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim() || !businessId) return
    
    setSearchState('LOADING')
    setCustomer(null)
    setStampsToAdd(1) // Reset counter on new search
    setErrorMsg('')
    setSearchedPhone(phoneNumber)

    const { data, error } = await supabase
      .from('customers')
      .select(`
        id, 
        name, 
        phone_number, 
        loyalty_balances!inner ( current_stamps )
      `)
      .eq('phone_number', phoneNumber)
      .eq('loyalty_balances.business_id', businessId)
      .single()

    if (error || !data) {
      setSearchState('NOT_FOUND')
      return
    }

    const balances = Array.isArray(data.loyalty_balances) ? data.loyalty_balances[0] : data.loyalty_balances

    setCustomer({
      id: data.id,
      name: data.name || 'Valued Customer',
      stamps: balances?.current_stamps || 0,
      phone: data.phone_number
    })
    
    setSearchState('FOUND')
  }

  // 2. Registration Logic
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Authentication error. Please log in again.')

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()
        
      if (businessError || !businessData) throw new Error('Could not find business profile.')

      const businessId = businessData.id

      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert([{ 
          business_id: businessId,
          phone_number: phoneNumber,
          name: newCustomerName || null 
        }])
        .select()
        .single()

      if (insertError) {
        if (insertError.code === '23505') throw new Error('This phone number is already registered.')
        throw new Error('Failed to create customer profile.')
      }

      const { error: balanceError } = await supabase
        .from('loyalty_balances')
        .insert([{
          customer_id: newCustomer.id,
          business_id: businessId,
          current_stamps: 0
        }])

      if (balanceError) throw new Error('Failed to initialize loyalty balance.')

      setCustomer({
        id: newCustomer.id,
        name: newCustomer.name || 'Valued Customer',
        stamps: 0,
        phone: newCustomer.phone_number
      })
      
      setSearchState('FOUND')
      setNewCustomerName('') 
      setStampsToAdd(1)
      
      setToastMessage('Customer phone number added!')
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRegistration = () => {
    setNewCustomerName('')
    setSearchState('NOT_FOUND')
  }

  // 3. Log Stamp Logic
  const handleLogStamp = async () => {
    if (!customer) return
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Authentication error. Please log in again.')

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()
        
      if (businessError || !businessData) throw new Error('Could not find business profile.')

      const businessId = businessData.id

      const { error: logError } = await supabase
        .from('transactions_log')
        .insert([{
          business_id: businessId,
          customer_id: customer.id,
          action_type: 'STAMP_ADDED',
          amount: stampsToAdd // Uses dynamic input
        }])

      if (logError) throw new Error('Failed to log transaction record.')

      const newStampCount = customer.stamps + stampsToAdd // Adds dynamic amount
      const { error: updateError } = await supabase
        .from('loyalty_balances')
        .update({ current_stamps: newStampCount })
        .eq('customer_id', customer.id)
        .eq('business_id', businessId)

      if (updateError) throw new Error('Failed to update current stamp total.')

      setCustomer({ ...customer, stamps: newStampCount })
      setStampsToAdd(1) // Reset counter to 1 after successful addition
      
      setToastMessage(`${stampsToAdd} Stamp${stampsToAdd > 1 ? 's' : ''} Logged Successfully!`)
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while logging the stamp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. Redeem Reward Logic
  const handleRedeemReward = async () => {
    if (!customer || customer.stamps < stampThreshold) return
    
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Authentication error. Please log in again.')

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()
        
      if (businessError || !businessData) throw new Error('Could not find business profile.')

      const businessId = businessData.id
      const stampsToDeduct = stampThreshold 

      const { error: logError } = await supabase
        .from('transactions_log')
        .insert([{
          business_id: businessId,
          customer_id: customer.id,
          action_type: 'REWARD_REDEEMED',
          amount: stampsToDeduct 
        }])

      if (logError) throw new Error('Failed to log redemption record.')

      const newStampCount = customer.stamps - stampsToDeduct
      const { error: updateError } = await supabase
        .from('loyalty_balances')
        .update({ current_stamps: newStampCount })
        .eq('customer_id', customer.id)
        .eq('business_id', businessId)

      if (updateError) throw new Error('Failed to deduct stamps.')

      setCustomer({ ...customer, stamps: newStampCount })
      
      setToastMessage('Reward Redeemed Successfully!')
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while redeeming the reward.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Toast Notification Pop-up */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="max-w-3xl mx-auto mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Customer Lookup</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="tel"
              required
              placeholder="Enter customer phone number (e.g., 0123456789)"
              className="flex-1 rounded-lg border border-gray-300 px-5 py-4 text-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                if (searchState === 'NOT_FOUND') {
                  setSearchState('IDLE') 
                }
              }}
            />
            <button
              type="submit"
              disabled={searchState === 'LOADING'}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
            >
              {searchState === 'LOADING' ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* State: CUSTOMER FOUND */}
        {searchState === 'FOUND' && customer && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 text-center ring-1 ring-green-100">
            <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
            <p className="text-gray-500 mb-8">{customer.phone}</p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8 inline-block min-w-[200px]">
              <p className="text-sm text-gray-500 font-medium mb-1">Current Stamps</p>
              <p className="text-5xl font-black text-blue-600">{customer.stamps}</p>
            </div>
            
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              
              {/* Dynamic Stamp Counter & Log Button */}
              <div className="flex gap-2 w-full">
                <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                  <button 
                    type="button"
                    onClick={() => setStampsToAdd(Math.max(1, stampsToAdd - 1))}
                    disabled={stampsToAdd <= 1 || isSubmitting}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-xl font-medium leading-none"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    min="1"
                    value={stampsToAdd}
                    onChange={(e) => setStampsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 text-center bg-transparent font-bold text-gray-900 outline-none appearance-none"
                    disabled={isSubmitting}
                  />
                  <button 
                    type="button"
                    onClick={() => setStampsToAdd(stampsToAdd + 1)}
                    disabled={isSubmitting}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 text-xl font-medium leading-none"
                  >
                    +
                  </button>
                </div>
                
                <button 
                  onClick={handleLogStamp}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-4 rounded-lg font-bold text-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging...' : 'Add Stamps'}
                </button>
              </div>
              
              {/* Permanent but Conditionally Disabled Redeem Button */}
              <button 
                onClick={handleRedeemReward}
                disabled={isSubmitting || customer.stamps < stampThreshold}
                className={`w-full px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-sm 
                  ${customer.stamps >= stampThreshold 
                    ? 'bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-50' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {isSubmitting && customer.stamps >= stampThreshold ? 'Processing...' : `Redeem Reward (${stampThreshold})`}
              </button>
            </div>
          </div>
        )}

        {/* State: CUSTOMER NOT FOUND */}
        {searchState === 'NOT_FOUND' && (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h3>
            <p className="text-gray-500 mb-8">No profile exists for <span className="font-semibold text-gray-800">{searchedPhone}</span>. Would you like to register them?</p>
            <button 
              onClick={() => setSearchState('REGISTERING')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Quick Register Customer
            </button>
          </div>
        )}
      </div>

      {/* State: REGISTERING (Overlay) */}
      {searchState === 'REGISTERING' && (
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">New Customer</h3>
              <p className="text-gray-500 mb-6">Registering: <span className="font-semibold text-gray-700">{phoneNumber}</span></p>
              
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jane Doe"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancelRegistration}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}
    </>
  )
}