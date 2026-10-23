// app/dashboard/analytics/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // 1. Identify the Merchant
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: businessData } = await supabase
    .from('businesses')
    .select('id')
    .eq('auth_user_id', userData.user.id)
    .single()

  if (!businessData) redirect('/login')

  const businessId = businessData.id

  // 2. Fetch Total Customers Count
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  // 3. Fetch Transactions with relation to Customers table for the phone number
  const { data: transactions } = await supabase
    .from('transactions_log')
    .select(`
      action_type, 
      amount, 
      amount_spent,
      created_at,
      customers ( phone_number )
    `)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  // 4. Calculate metrics 
  let totalStampsGiven = 0
  let totalRewardsRedeemed = 0

  if (transactions) {
    transactions.forEach((tx: any) => {
      if (tx.action_type === 'STAMP_ADDED') {
        totalStampsGiven += tx.amount
      } else if (tx.action_type === 'REWARD_REDEEMED') {
        totalRewardsRedeemed += 1 
      }
    })
  }

  const recentTransactions = transactions?.slice(0, 5) || []

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Store Analytics</h2>

      {/* Top Metrics Cards - Back to 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Card 1: Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Customers</p>
          <p className="text-4xl font-black text-blue-600">{totalCustomers || 0}</p>
        </div>

        {/* Card 2: Stamps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Stamps Issued</p>
          <p className="text-4xl font-black text-blue-600">{totalStampsGiven}</p>
        </div>

        {/* Card 3: Rewards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500 mb-1">Rewards Claimed</p>
          <p className="text-4xl font-black text-amber-500">{totalRewardsRedeemed}</p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="p-6">
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity found.</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((tx: any, index: number) => {
                const phone = Array.isArray(tx.customers) 
                  ? tx.customers[0]?.phone_number 
                  : tx.customers?.phone_number

                return (
                  <div key={index} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.action_type === 'STAMP_ADDED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {tx.action_type === 'STAMP_ADDED' ? '+' : '★'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 flex flex-wrap items-center gap-2">
                          {tx.action_type === 'STAMP_ADDED' ? 'Stamp Added' : 'Reward Redeemed'}
                          <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                            {phone || 'Unknown'}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {new Date(tx.created_at || Date.now()).toLocaleDateString('en-MY', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className={`font-bold ${tx.action_type === 'STAMP_ADDED' ? 'text-blue-600' : 'text-amber-500'}`}>
                        {tx.action_type === 'STAMP_ADDED' ? `+${tx.amount} Stamps` : `-${tx.amount} Stamps`}
                      </div>
                      {tx.action_type === 'STAMP_ADDED' && tx.amount_spent && (
                        <div className="text-sm font-semibold text-green-600 mt-0.5">
                          +RM {Number(tx.amount_spent).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}