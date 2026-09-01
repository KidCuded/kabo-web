// app/api/curlec/checkout/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. Verify the merchant is logged in
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch business details for the billing profile
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, store_name, contact_number')
      .eq('auth_user_id', userData.user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // 3. Define Curlec Parameters
    // (Note: Check your specific Curlec API documentation for exact field names)
    const merchantId = process.env.CURLEC_MERCHANT_ID
    const merchantSecret = process.env.CURLEC_MERCHANT_SECRET
    
    if (!merchantId || !merchantSecret) {
      throw new Error('Curlec credentials missing from environment variables')
    }

    const orderReference = `KABO_${business.id}_${Date.now()}`
    const amount = "50.00"

    // 4. Generate the Security Signature (Hash)
    // Curlec typically requires a SHA256 hash of the payload + your secret key
    const rawString = `${merchantId}${orderReference}${amount}${merchantSecret}`
    const signature = crypto.createHash('sha256').update(rawString).digest('hex')

    // 5. Construct the final payload
    const curlecPayload = {
      merchantId: merchantId,
      reference: orderReference,
      amount: amount,
      customerName: business.store_name,
      customerPhone: business.contact_number || '0000000000',
      signature: signature,
      // The URL Curlec will send the user back to after payment:
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?status=processing`
    }

    return NextResponse.json({ payload: curlecPayload })

  } catch (error: any) {
    console.error('Curlec Checkout Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}