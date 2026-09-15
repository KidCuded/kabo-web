// app/dashboard/customers/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CustomerProfilePage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params;
  const customerId = params.id
  const supabase = await createClient()

  // 1. Verify Authentication & Business Ownership
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: businessData } = await supabase
    .from('businesses')
    .select('id')
    .eq('auth_user_id', userData.user.id)
    .single()

  if (!businessData) redirect('/login')

  // 2. Fetch Customer Details (Ensure this customer belongs to this business)
  const { data: customer } = await supabase
    .from('customers')
    .select(`
      *,
      loyalty_balances ( current_stamps )
    `)
    .eq('id', customerId)
    .eq('business_id', businessData.id)
    .single()

  if (!customer) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
        <p className="text-gray-500 mb-6">This profile doesn't exist or doesn't belong to your store.</p>
        <Link href="/dashboard/customers" className="text-blue-600 font-semibold hover:underline">
          &larr; Back to Directory
        </Link>
      </div>
    )
  }

  // 3. Fetch Transaction History for this specific customer
  const { data: transactions } = await supabase
    .from('transactions_log')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  // Safely extract stamp balance
  const balances = Array.isArray(customer.loyalty_balances) 
    ? customer.loyalty_balances[0] 
    : customer.loyalty_balances
  const currentStamps = balances?.current_stamps || 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header & Back Button */}
      <div className="mb-8">
        <Link href="/dashboard/customers" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Directory
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900">{customer.name || 'Valued Customer'}</h2>
            <p className="text-lg text-gray-500 font-medium mt-1">{customer.phone_number}</p>
          </div>
          <p className="text-sm text-gray-400">
            Joined {customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
          </p>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Available Stamps</p>
            <p className="text-4xl font-black text-blue-600">{currentStamps}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Lifetime Value</p>
            <p className="text-4xl font-black text-green-600">
              <span className="text-xl mr-1">RM</span>
              {(customer.total_spent || 0).toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>

      {/* Transaction Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        </div>
        
        <div className="p-6">
          {!transactions || transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No transactions found for this customer.</p>
          ) : (
            <div className="space-y-6">
              {transactions.map((tx: any, index: number) => (
                <div key={tx.id || index} className="flex gap-4">
                  
                  {/* Timeline Line & Icon */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${tx.action_type === 'STAMP_ADDED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                      {tx.action_type === 'STAMP_ADDED' ? '+' : '★'}
                    </div>
                    {/* Don't show the connecting line on the last item */}
                    {index !== transactions.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {tx.action_type === 'STAMP_ADDED' ? 'Stamps Added' : 'Reward Claimed'}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date(tx.created_at || Date.now()).toLocaleString('en-MY', {
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          })}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-black text-xl ${tx.action_type === 'STAMP_ADDED' ? 'text-blue-600' : 'text-amber-500'}`}>
                          {tx.action_type === 'STAMP_ADDED' ? `+${tx.amount}` : `-${tx.amount}`}
                        </p>
                        {tx.action_type === 'STAMP_ADDED' && tx.amount_spent && (
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            +RM {Number(tx.amount_spent).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}