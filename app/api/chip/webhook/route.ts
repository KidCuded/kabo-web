// app/api/chip/webhook/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // 1. Extract the raw body and signature
    const body = await request.text()
    const signature = request.headers.get('x-signature')

    if (!signature) {
      return new NextResponse('Missing signature', { status: 401 })
    }

    // 2. Verify the webhook payload using CHIP's Public Key
    //const publicKey = process.env.CHIP_WEBHOOK_PUBLIC_KEY!.replace(/\\n/g, '\n')
    const publicKey = process.env.CHIP_WEBHOOK_PUBLIC_KEY_TEST!.replace(/\\n/g, '\n')
    
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.update(body)
    const isVerified = verifier.verify(publicKey, signature, 'base64')

    if (!isVerified) {
      console.error('CHIP Webhook: Signature verification failed')
      return new NextResponse('Invalid signature', { status: 401 })
    }

    console.log('Webhook signature verified successfully. Processing event...');

    // 3. Parse the verified event
    const event = JSON.parse(body)
    const eventType = JSON.stringify(event.event_type, null, 2)

    // 4. Initialize Supabase Admin Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 5. Handle Successful Payment
    if (eventType == 'purchase.paid') {
      console.log('Processing successful purchase event...');
      const businessId = event.reference // The business ID we passed during checkout
      
      // CHIP's identifiers
      const purchaseId = event.id
      const subscriptionToken = event.recurring_token || purchaseId
      const clientId = event.client_id || event.client?.id

      const nextBillingDate = new Date()
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

      // 👉 THIS is where they are saved to your database
      const { error } = await supabase
        .from('businesses')
        .update({ 
          subscription_status: 'active',
          chip_subscription_id: subscriptionToken, 
          chip_client_id: clientId, 
          next_billing_date: nextBillingDate.toISOString().split('T')[0]
        })
        .eq('id', businessId)

      if (error) throw error
      console.log(`CHIP Webhook: Business ${businessId} upgraded to Active`)
    }
    // 6. Handle Refunded Payments (Corrected Event Name)
    else if (event.event_name === 'payment.refunded') {
      // Depending on CHIP's payment object, the reference is usually attached to the parent purchase object
      const businessId = event.purchase?.reference || event.reference
      
      if (businessId) {
        await supabase
          .from('businesses')
          .update({ subscription_status: 'cancelled' })
          .eq('id', businessId)
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 })

  } catch (error: any) {
    console.error('CHIP Webhook Error:', error)
    return new NextResponse('Internal Webhook Error', { status: 500 })
  }
}