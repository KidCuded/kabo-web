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

  // 2. Fetch Customer Details
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

  // 3. Fetch Transaction History
  const { data: transactions } = await supabase
    .from('transactions_log')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  // 4. Fetch Customer Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('customer_id', customerId)
    .eq('business_id', businessData.id)
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
            <p className="text-sm text-gray-400 mt-1">
              Joined {customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
            </p>
          </div>
          
          {/* Action Button: Redirect to Stamp Counter */}
          <Link 
            href={`/dashboard?phone=${encodeURIComponent(customer.phone_number)}`}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Give Stamps
          </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Transaction Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          </div>
          
          <div className="p-6">
            {!transactions || transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions found.</p>
            ) : (
              <div className="space-y-6">
                {transactions.map((tx: any, index: number) => (
                  <div key={tx.id || index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${tx.action_type === 'STAMP_ADDED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {tx.action_type === 'STAMP_ADDED' ? '+' : '★'}
                      </div>
                      {index !== transactions.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-100 mt-2"></div>
                      )}
                    </div>

                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-base">
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
                          <p className={`font-black text-lg ${tx.action_type === 'STAMP_ADDED' ? 'text-blue-600' : 'text-amber-500'}`}>
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

        {/* Right Column: Feedback & Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Customer Feedback</h3>
          </div>
          
          <div className="p-6">
            {!reviews || reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews left by this customer yet.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {new Date(review.created_at).toLocaleDateString('en-MY', { dateStyle: 'medium' })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed border border-gray-100">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}