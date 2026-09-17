// app/api/curlec/webhook/route.ts
import { NextResponse } from 'next/server'
// REMOVED: import { createClient } from '@/utils/supabase/server'
// ADDED:
import { createClient } from '@supabase/supabase-js'
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const isValid = validateWebhookSignature(
      rawBody,
      signature,
      process.env.CURLEC_WEBHOOK_SECRET!
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload.event

    // INIT SUPABASE WITH SERVICE ROLE KEY (Bypasses cookies and RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Make sure this is in your .env.local
    )

    const businessId = payload.payload.subscription.entity.notes.business_id

    if (!businessId) {
      return NextResponse.json({ error: 'No business_id found in notes' }, { status: 400 })
    }

    if (eventType === 'subscription.activated') {
      const subscriptionEntity = payload.payload.subscription.entity
      
      // Extract the subscription/mandate ID
      const mandateId = subscriptionEntity.id 
      
      // Curlec sends 'charge_at' as a Unix timestamp in seconds, so we multiply by 1000 for JavaScript
      const nextBillingDate = subscriptionEntity.charge_at 
        ? new Date(subscriptionEntity.charge_at * 1000).toISOString() 
        : null

      await supabase
        .from('businesses')
        .update({ 
          subscription_status: 'active',
          curlec_mandate_id: mandateId,
          next_billing_date: nextBillingDate
        })
        .eq('id', businessId)
    }

    else if (eventType === 'subscription.charged') {
      const subscriptionEntity = payload.payload.subscription.entity
      const nextBillingDate = subscriptionEntity.charge_at 
        ? new Date(subscriptionEntity.charge_at * 1000).toISOString() 
        : null

      await supabase
        .from('businesses')
        .update({ 
          next_billing_date: nextBillingDate
        })
        .eq('id', businessId)
    }
    
    else if (eventType === 'subscription.cancelled' || eventType === 'subscription.halted') {
      await supabase
        .from('businesses')
        .update({ subscription_status: 'inactive' })
        .eq('id', businessId)
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })

  } catch (error) {
    console.error('Webhook processing failed:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}