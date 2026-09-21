// app/api/curlec/cancel/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // 1. Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Retrieve their Curlec Subscription ID from the database
    const { data: business, error: dbError } = await supabase
      .from('businesses')
      .select('curlec_mandate_id')
      .eq('auth_user_id', user.id)
      .single()

    if (dbError || !business?.curlec_mandate_id) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 })
    }

    const subscriptionId = business.curlec_mandate_id
    // 3. Authenticate with Curlec / Razorpay
    const keyId = process.env.NEXT_PUBLIC_CURLEC_KEY_ID
    const keySecret = process.env.CURLEC_KEY_SECRET
    
    if (!keyId || !keySecret) {
      throw new Error('Missing payment provider credentials')
    }

    // 4. Call the Razorpay API to cancel the subscription
    const curlecRes = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // 1 = Cancel at the end of the current billing cycle (Merchant retains access until then)
        // 0 = Cancel immediately (Prorated refunds would be required)
        cancel_at_cycle_end: 1 
      })
    })

    const curlecData = await curlecRes.json()

    if (!curlecRes.ok) {
      console.error('Curlec cancellation error:', curlecData)
      return NextResponse.json({ error: 'Failed to cancel via payment provider.' }, { status: 400 })
    }

    // 5. Update the status in your Supabase database immediately for a snappy UI response.
    // (Your Webhook will also catch this event as a backup)
    await supabase
      .from('businesses')
      .update({ subscription_status: 'cancelled' })
      .eq('auth_user_id', user.id)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Cancel Subscription API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}