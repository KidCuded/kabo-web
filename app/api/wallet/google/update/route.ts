// app/api/wallet/update/route.ts
import { NextResponse } from 'next/server'
import { pushGoogleWalletUpdate } from '@/features/updateGooglePass'
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
    // Safely extract and convert the entire error payload to a lowercase string
    const errorMessage = String(error?.message || error?.response?.data || error).toLowerCase();
    
    // Broaden the check to catch nested API responses and standard 404 statuses
    const isNotFoundError = errorMessage.includes('not found') || error?.status === 404 || error?.response?.status === 404;

    if (isNotFoundError) {
      // Silently exit without throwing a console error for Apple Wallet users
      return NextResponse.json({ 
        success: true, 
        message: 'No Google Wallet pass exists for this user yet. Skipped.' 
      });
    }

    // If it is a real error (like 500 or auth failure), log it as usual
    console.error('Failed to update Google Wallet:', error);
    return NextResponse.json({ error: 'Failed to update Google Wallet' }, { status: 500 });
  }
}