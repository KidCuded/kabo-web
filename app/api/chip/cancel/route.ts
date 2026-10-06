// app/api/chip/cancel/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/client' // Adjust if your server client path is different

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // 1. Authenticate the user making the request
    const { data: userData, error: authError } = await (await supabase).auth.getUser()

    if (authError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch the business and its CHIP subscription ID
    const { data: business, error: fetchError } = await (await supabase)
      .from('businesses')
      .select('id, chip_subscription_id, subscription_status')
      .eq('auth_user_id', userData.user.id)
      .single()

    if (fetchError || !business) {
      return NextResponse.json({ error: 'Business profile not found' }, { status: 404 })
    }

    if (business.subscription_status === 'cancelled') {
      return NextResponse.json({ error: 'Subscription is already cancelled' }, { status: 400 })
    }

    // 3. Communicate with CHIP to cancel the recurring billing token
    if (business.chip_subscription_id) {
      // Deletes the recurring token associated with the original purchase
      const chipResponse = await fetch(`https://gate.chip-in.asia/api/v1/purchases/${business.chip_subscription_id}/recurring_token/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.CHIP_API_KEY}`,
          'Content-Type': 'application/json',
        }
      })

      if (!chipResponse.ok) {
        const errorData = await chipResponse.json().catch(() => ({}))
        console.error('CHIP API Cancellation Error:', errorData)
        // Log the error but proceed to cancel locally in case the token 
        // was already manually deleted on the CHIP dashboard.
      }
    }

    // 4. Update Supabase to mark the subscription as cancelled
    // The user's store remains active until their current billing cycle runs out
    const { error: updateError } = await (await supabase)
      .from('businesses')
      .update({ 
        subscription_status: 'cancelled' 
      })
      .eq('id', business.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, message: 'Subscription successfully cancelled' })

  } catch (error: any) {
    console.error('Cancellation Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while cancelling your subscription. Please contact support.' }, 
      { status: 500 }
    )
  }
}