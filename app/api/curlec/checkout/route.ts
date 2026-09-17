// app/api/curlec/checkout/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Razorpay from 'razorpay'

const curlec = new Razorpay({
  key_id: process.env.CURLEC_KEY_ID!,
  key_secret: process.env.CURLEC_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch the merchant's business details to attach to the subscription
    const { data: business } = await supabase
      .from('businesses')
      .select('id, store_name')
      .eq('auth_user_id', userData.user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // 2. Create the recurring subscription in Curlec
    const subscription = await curlec.subscriptions.create({
      plan_id: process.env.NEXT_PUBLIC_CURLEC_PRO_PLAN_ID!,
      customer_notify: 1,
      total_count: 120, // E.g., 10 years of monthly billing
      notes: {
        business_id: business.id, // Pass this so your webhook knows who paid
        store_name: business.store_name,
      }
    })

    // 3. Return the generated subscription ID to the frontend
    return NextResponse.json({ 
      subscriptionId: subscription.id 
    })

  } catch (error: any) {
    console.error('Curlec API Error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize checkout' }, 
      { status: 500 }
    )
  }
}