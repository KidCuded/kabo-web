// app/api/wallet/update/route.ts
import { NextResponse } from 'next/server'
import { pushGoogleWalletUpdate } from '@/utils/updateGooglePass'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { businessId, customerId, newStampCount } = await request.json()

    if (!businessId || !customerId || newStampCount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch the threshold to format the "X of Y" string
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: rulesData } = await supabase
      .from('loyalty_rules')
      .select('stamp_threshold')
      .eq('business_id', businessId)
      .single()
      
    const threshold = rulesData?.stamp_threshold || 10

    // Pass the threshold into the utility
    await pushGoogleWalletUpdate(businessId, customerId, newStampCount, threshold)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('WALLET UPDATE ROUTE ERROR:', error)
    return NextResponse.json({ error: 'Failed to sync wallet update' }, { status: 500 })
  }
}