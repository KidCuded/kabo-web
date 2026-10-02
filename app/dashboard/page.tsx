// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Scanner } from '@yudiel/react-qr-scanner'
import { sendAppleWalletPush } from '@/utils/applePush'

export default function DashboardPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [searchedPhone, setSearchedPhone] = useState('')
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [stampThreshold, setStampThreshold] = useState<number>(10)
  const [searchState, setSearchState] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND' | 'REGISTERING'>('IDLE')
  
  const [customer, setCustomer] = useState<{ id: string; name: string; stamps: number; phone: string; totalSpent: number } | null>(null)
  const [stampsToAdd, setStampsToAdd] = useState<number>(1)
  const [amountSpent, setAmountSpent] = useState<string>('') 
  
  const [newCustomerName, setNewCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const supabase = createClient()

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
  }, [supabase])

  const handleSearch = async (e?: React.FormEvent, phoneOverride?: string) => {
    if (e) e.preventDefault()
    const targetPhone = phoneOverride || phoneNumber
    if (!targetPhone.trim() || !businessId) return
    
    setSearchState('LOADING')
    setCustomer(null)
    setStampsToAdd(1) 
    setAmountSpent('')
    setErrorMsg('')
    setSearchedPhone(targetPhone)

    const { data, error } = await supabase
      .from('customers')
      .select(`
        id, 
        name, 
        phone_number,
        total_spent,
        loyalty_balances!inner ( current_stamps )
      `)
      .eq('phone_number', targetPhone)
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
      phone: data.phone_number,
      totalSpent: data.total_spent || 0
    })
    
    setSearchState('FOUND')
  }

  // --- QR SCANNER INTEGRATION ---
  const handleScanQR = () => {
    setIsScanning(true)
  }

  const handleScanSuccess = (text: string) => {
    if (text) {
      setIsScanning(false) 
      setPhoneNumber(text) 
      handleSearch(undefined, text) 
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessId) return
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('Authentication error. Please log in again.')

      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert([{ 
          business_id: businessId,
          phone_number: phoneNumber,
          name: newCustomerName || null,
          total_spent: 0
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
        phone: newCustomer.phone_number,
        totalSpent: 0
      })
      
      setSearchState('FOUND')
      setNewCustomerName('') 
      setStampsToAdd(1)
      setAmountSpent('')
      
      setToastMessage('Customer registered successfully!')
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogStamp = async () => {
    if (!customer || !businessId) return
    
    const spendValue = parseFloat(amountSpent)
    if (isNaN(spendValue) || spendValue < 0) {
      setErrorMsg('Please enter a valid amount spent.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      // 1. Log the transaction
      const { error: logError } = await supabase
        .from('transactions_log')
        .insert([{
          business_id: businessId,
          customer_id: customer.id,
          action_type: 'STAMP_ADDED',
          amount: stampsToAdd,
          amount_spent: spendValue
        }])

      if (logError) throw new Error('Failed to log transaction record.')

      // 2. Update the stamp balance in database
      const newStampCount = customer.stamps + stampsToAdd 
      const { error: updateError } = await supabase
        .from('loyalty_balances')
        .update({ current_stamps: newStampCount })
        .eq('customer_id', customer.id)
        .eq('business_id', businessId)

      if (updateError) throw new Error('Failed to update current stamp total.')

      // 3. Update customer's total spent
      const newTotalSpent = customer.totalSpent + spendValue
      const { error: customerError } = await supabase
        .from('customers')
        .update({ total_spent: newTotalSpent })
        .eq('id', customer.id)
        
      if (customerError) throw new Error('Failed to update customer lifetime spending.')

      // 4. --- SYNC WITH GOOGLE WALLET ---
      try {
        await fetch('/api/wallet/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: businessId,
            phoneNumber: customer.phone,
            newStampCount: newStampCount
          })
        })
      } catch (walletErr) {
        console.error("Google Wallet sync skipped/failed:", walletErr)
      }

      // 5. --- SYNC WITH APPLE WALLET ---
      // 1. Find all Apple devices registered to this specific customer
      const { data: devices } = await supabase
        .from('apple_wallet_registrations')
        .select('push_token')
        .eq('customer_id', customer.id) // The UUID of the customer who just got a stamp

      // 2. Fire off a push notification to every device they own
      if (devices && devices.length > 0) {
        await Promise.all(
          devices.map(device => sendAppleWalletPush(device.push_token))
        )
      }

      // Update UI state
      setCustomer({ ...customer, stamps: newStampCount, totalSpent: newTotalSpent })
      setStampsToAdd(1) 
      setAmountSpent('')
      
      setToastMessage(`${stampsToAdd} Stamp${stampsToAdd > 1 ? 's' : ''} Logged!`)
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while logging the stamp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRedeemReward = async () => {
    if (!customer || !businessId || customer.stamps < stampThreshold) return
    
    setIsSubmitting(true)
    setErrorMsg('')

    try {
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

      // Sync deduction with Google Wallet
      try {
        await fetch('/api/wallet/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: businessId,
            phoneNumber: customer.phone,
            newStampCount: newStampCount
          })
        })
      } catch (walletErr) {
        console.error("Google Wallet sync skipped/failed:", walletErr)
      }

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
      {toastMessage && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 bg-gray-900 text-white px-5 py-3 sm:px-6 sm:py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium text-sm sm:text-base">{toastMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="max-w-3xl mx-auto mb-4 sm:mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200 mx-4 sm:mx-0">
          {errorMsg}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-0">
        
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-8 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Customer Lookup</h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="tel"
              required
              placeholder="Phone number (e.g., 0123456789)"
              className="flex-1 w-full rounded-lg border border-gray-300 px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                if (searchState === 'NOT_FOUND') setSearchState('IDLE') 
              }}
            />
            
            <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Scan QR Button */}
              <button
                type="button"
                onClick={handleScanQR}
                className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 sm:py-4 rounded-lg font-semibold transition-colors border border-gray-300 shadow-sm shrink-0"
                title="Scan QR Code"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="5" height="5" rx="1" />
                  <rect x="16" y="3" width="5" height="5" rx="1" />
                  <rect x="3" y="16" width="5" height="5" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                  <path d="M21 21v.01" />
                  <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                  <path d="M3 12h.01" />
                  <path d="M12 3h.01" />
                  <path d="M12 16v.01" />
                  <path d="M16 12h1" />
                  <path d="M21 12v.01" />
                  <path d="M12 21v-1" />
                </svg>
              </button>

              <button
                type="submit"
                disabled={searchState === 'LOADING'}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors disabled:opacity-50"
              >
                {searchState === 'LOADING' ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* State: CUSTOMER FOUND */}
        {searchState === 'FOUND' && customer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-8 text-center ring-1 ring-gray-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{customer.name}</h3>
            <p className="text-gray-500 mb-4">{customer.phone}</p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 sm:mb-8">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 flex-1 max-w-[200px] mx-auto sm:mx-0 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">Current Stamps</p>
                <p className="text-4xl font-black text-blue-600">{customer.stamps}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 flex-1 min-w-fit max-w-[200px] mx-auto sm:mx-0 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium mb-1">Total Spent</p>
                <p className="text-4xl font-black text-blue-600">
                  <span className="text-xl mr-1">RM</span>
                  {customer.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* Add Stamps Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 max-w-sm mx-auto mb-4">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 text-left mb-1">Stamps to Add</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 w-full">
                  <div className="flex items-center justify-between sm:justify-center bg-white rounded-lg p-1 border border-gray-300 w-full">
                    <button 
                      type="button"
                      onClick={() => setStampsToAdd(Math.max(1, stampsToAdd - 1))}
                      disabled={stampsToAdd <= 1 || isSubmitting}
                      className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-50 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-2xl sm:text-xl font-medium leading-none active:bg-gray-200"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      min="1"
                      value={stampsToAdd}
                      onChange={(e) => setStampsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-12 sm:h-10 text-center bg-transparent font-bold text-lg sm:text-base text-gray-900 outline-none appearance-none"
                      disabled={isSubmitting}
                    />
                    <button 
                      type="button"
                      onClick={() => setStampsToAdd(stampsToAdd + 1)}
                      disabled={isSubmitting}
                      className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-50 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-2xl sm:text-xl font-medium leading-none active:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Amount Spent Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 text-left mb-1">Checkout Amount (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    value={amountSpent}
                    onChange={(e) => setAmountSpent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    disabled={isSubmitting}
                  />
                </div>
                <button 
                    onClick={handleLogStamp}
                    disabled={isSubmitting || !amountSpent}
                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors shadow-sm disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? 'Logging...' : 'Add Stamps'}
                  </button>
              </div>
            </div>

            <div className="max-w-sm mx-auto">
              <button 
                onClick={handleRedeemReward}
                disabled={isSubmitting || customer.stamps < stampThreshold}
                className={`w-full px-4 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors shadow-sm active:scale-95
                  ${customer.stamps >= stampThreshold 
                    ? 'bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-50' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                {isSubmitting && customer.stamps >= stampThreshold ? 'Processing...' : `Redeem Reward (${stampThreshold} Stamps)`}
              </button>
            </div>
          </div>
        )}

        {/* State: CUSTOMER NOT FOUND */}
        {searchState === 'NOT_FOUND' && (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-5 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Customer Not Found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">No profile exists for <span className="font-semibold text-gray-800">{searchedPhone}</span>. Would you like to register them?</p>
            <button 
              onClick={() => setSearchState('REGISTERING')}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors active:scale-95"
            >
              Quick Register
            </button>
          </div>
        )}
      </div>

      {/* State: REGISTERING */}
      {searchState === 'REGISTERING' && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 sm:p-8 w-full max-w-md">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">New Customer</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-6">Registering: <span className="font-semibold text-gray-700">{phoneNumber}</span></p>
              
              <form onSubmit={handleRegister} className="space-y-5 sm:space-y-6">
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
                
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCustomerName('')
                      setSearchState('NOT_FOUND')
                    }}
                    className="w-full sm:flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors active:bg-gray-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? 'Saving...' : 'Register'}
                  </button>
                </div>
              </form>
            </div>
          </div>
      )}

      {/* QR Code Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Scan Customer Pass</h3>
              <button 
                onClick={() => setIsScanning(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="aspect-square w-full bg-black relative">
              <Scanner 
                onScan={(result) => handleScanSuccess(result[0].rawValue)}
                components={{
                  finder: true, 
                }}
              />
            </div>
            
            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
              Position the customer's Google Wallet QR code inside the frame.
            </div>
          </div>
        </div>
      )}
    </>
  )
}