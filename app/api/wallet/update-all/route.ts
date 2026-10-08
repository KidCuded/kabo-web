// app/api/wallet/update-all/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { pushGoogleWalletUpdate } from '@/utils/updateGooglePass'

export async function POST(request: Request) {
  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Fetch all customers holding a pass for this business
    const { data: balances, error } = await supabase
      .from('loyalty_balances')
      .select('customer_id, current_stamps')
      .eq('business_id', businessId)

    if (error || !balances) throw new Error('Failed to fetch customer balances')

    // Push the dynamic strip update to every customer's Google Wallet Object.
    // We use Promise.all to execute the network requests concurrently for speed.
    await Promise.all(
      balances.map(balance => 
        pushGoogleWalletUpdate(businessId, balance.customer_id, balance.current_stamps)
      )
    )

    return NextResponse.json({ success: true, updatedCount: balances.length })
  } catch (error: any) {
    console.error('MASS WALLET UPDATE ERROR:', error)
    return NextResponse.json({ error: 'Failed to mass update passes' }, { status: 500 })
  }
}