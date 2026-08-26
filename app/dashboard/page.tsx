// app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [searchState, setSearchState] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND' | 'REGISTERING'>('IDLE')
  
  const [customer, setCustomer] = useState<{ id: string; name: string; stamps: number; phone: string } | null>(null)
  
  // Registration & Toast State
  const [newCustomerName, setNewCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMessage, setToastMessage] = useState('') // New state for success pop-ups

  const supabase = createClient()

  // 1. Search Logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) return
    
    setSearchState('LOADING')
    setCustomer(null)
    setErrorMsg('')

    const { data, error } = await supabase
      .from('customers')
      .select(`id, name, phone_number, loyalty_balances ( current_stamps )`)
      .eq('phone_number', phoneNumber)
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

      // Step 1: Insert into Customers table
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

      // Step 2: Initialize Loyalty Balance
      const { error: balanceError } = await supabase
        .from('loyalty_balances')
        .insert([{
          customer_id: newCustomer.id,
          business_id: businessId,
          current_stamps: 0
        }])

      if (balanceError) throw new Error('Failed to initialize loyalty balance.')

      // Success Setup
      setCustomer({
        id: newCustomer.id,
        name: newCustomer.name || 'Valued Customer',
        stamps: 0,
        phone: newCustomer.phone_number
      })
      
      // Close modal, clear input, show toast
      setSearchState('FOUND')
      setNewCustomerName('') 
      
      setToastMessage('Customer phone number added!')
      setTimeout(() => setToastMessage(''), 3000) // Hide toast after 3 seconds

    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Cancel Button
  const handleCancelRegistration = () => {
    setNewCustomerName('') // Clear the text field on cancel
    setSearchState('NOT_FOUND')
  }

  // 3. Log Stamp Logic
  const handleLogStamp = async () => {
    if (!customer) return
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      // Step 1: Retrieve the business ID for logging
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Authentication error. Please log in again.')

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()
        
      if (businessError || !businessData) throw new Error('Could not find business profile.')

      const businessId = businessData.id

      // Step 2: Insert into Transactions Log
      const { error: logError } = await supabase
        .from('transactions_log')
        .insert([{
          business_id: businessId,
          customer_id: customer.id,
          action_type: 'STAMP_ADDED',
          amount: 1
        }])

      if (logError) throw new Error('Failed to log transaction record.')

      // Step 3: Update the Cumulative Balance
      const newStampCount = customer.stamps + 1
      const { error: updateError } = await supabase
        .from('loyalty_balances')
        .update({ current_stamps: newStampCount })
        .eq('customer_id', customer.id)
        .eq('business_id', businessId)

      if (updateError) throw new Error('Failed to update current stamp total.')

      // Step 4: Update the UI state instantly
      setCustomer({ ...customer, stamps: newStampCount })
      
      setToastMessage('Stamp Logged Successfully!')
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while logging the stamp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 4. Redeem Reward Logic
  const handleRedeemReward = async () => {
    // Ensure customer exists and has at least 10 stamps
    if (!customer || customer.stamps < 10) return
    
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      // 1. Retrieve the business ID
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Authentication error. Please log in again.')

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()
        
      if (businessError || !businessData) throw new Error('Could not find business profile.')

      const businessId = businessData.id
      const stampsToDeduct = 10 // This could later be fetched dynamically from loyalty_rules

      // 2. Insert into Transactions Log
      const { error: logError } = await supabase
        .from('transactions_log')
        .insert([{
          business_id: businessId,
          customer_id: customer.id,
          action_type: 'REWARD_REDEEMED',
          amount: stampsToDeduct // Tracking how many stamps were spent
        }])

      if (logError) throw new Error('Failed to log redemption record.')

      // 3. Update the Cumulative Balance (Deduct 10 stamps)
      const newStampCount = customer.stamps - stampsToDeduct
      const { error: updateError } = await supabase
        .from('loyalty_balances')
        .update({ current_stamps: newStampCount })
        .eq('customer_id', customer.id)
        .eq('business_id', businessId)

      if (updateError) throw new Error('Failed to deduct stamps.')

      // 4. Update the UI state instantly
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
              onChange={(e) => setPhoneNumber(e.target.value)}
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
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center ring-1 ring-green-100">
              <h3 className="text-2xl font-bold text-gray-900">{customer.name}</h3>
            <p className="text-gray-500 mb-8">{customer.phone}</p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8 inline-block min-w-[200px]">
              <p className="text-sm text-gray-500 font-medium mb-1">Current Stamps</p>
              <p className="text-5xl font-black text-blue-600">{customer.stamps}</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleLogStamp}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg w-full max-w-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Logging...' : '+1 Stamp'}
              </button>
              
              {customer.stamps >= 10 && (
                <button 
                  onClick={handleRedeemReward}
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-lg font-bold text-lg w-full max-w-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Redeem Reward'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* State: CUSTOMER NOT FOUND */}
        {searchState === 'NOT_FOUND' && (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h3>
            <p className="text-gray-500 mb-8">No profile exists for {phoneNumber}. Would you like to register them?</p>
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
              
              
              {/* Customer Registration input */}
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
                
                {/* Cancel button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCancelRegistration}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>

                  {/* Submit button */}
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