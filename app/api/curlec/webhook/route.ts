// app/api/curlec/webhook/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// 1. Initialize Supabase Admin Client (Bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // Curlec webhooks typically send form data or JSON. We will parse it as JSON here.
    const payload = await request.json()
    
    const { 
      merchantId, 
      reference, 
      mandateId, 
      status, 
      signature 
    } = payload

    const merchantSecret = process.env.CURLEC_MERCHANT_SECRET

    if (!merchantSecret) {
      throw new Error('Server misconfiguration: Missing secret')
    }

    // 2. Verify the Webhook Signature
    // This proves the request actually came from Curlec and wasn't spoofed.
    // (Adjust the rawString order based on Curlec's specific webhook documentation)
    const rawString = `${merchantId}${reference}${status}${mandateId}${merchantSecret}`
    const expectedSignature = crypto.createHash('sha256').update(rawString).digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 3. Extract the full Business ID
    // We expect the reference to look like: KABO_businessId_timestamp
    const parts = reference.split('_')
    const businessId = parts[1]

    if (!businessId) {
      return NextResponse.json({ error: 'Malformed reference' }, { status: 400 })
    }

    // 4. Handle a Successful Mandate
    if (status === 'SUCCESS' || status === 'ACTIVE') {
      const { error: updateError } = await supabaseAdmin
        .from('businesses')
        .update({ 
          subscription_status: 'active',
          curlec_mandate_id: mandateId 
        })
        .eq('id', businessId)

      if (updateError) {
        console.error('Database update failed:', updateError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }
    } else if (status === 'FAILED' || status === 'REJECTED') {
      // Optional: Handle mandate failures (e.g., mark as 'inactive', send an email alert)
      console.log(`Mandate failed for store: ${businessId}`)
    }

    // 5. Acknowledge Receipt
    // Payment gateways require a 200 OK response, otherwise they will keep retrying.
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}