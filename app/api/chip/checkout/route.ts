import { NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js' // Uncomment if you need to fetch DB prices

export async function POST(request: Request) {
  try {
    // 1. Extract the data sent from your frontend checkout button
    const body = await request.json()
    
    // Adjust these destructured variables based on what your frontend actually sends
    const { businessId, planId, customerEmail, customerName } = body

    if (!businessId || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Determine the price
    // If you fetch prices dynamically from Supabase, do it here.
    // For this example, let's assume a subscription is RM 150.00
    const amount = 150.00 
    
    // CRITICAL: CHIP requires all prices in cents (e.g., RM 150.00 = 15000)
    const amountInCents = Math.round(amount * 100)

    // 3. Build the CHIP Purchase Payload
    const payload = {
      brand_id: process.env.CHIP_BRAND_ID,
      
      // We pass the businessId as a 'reference' so your Webhook knows which business paid
      reference: businessId, 
      
      // Where CHIP sends the user after they finish the payment page
      success_redirect: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      failure_redirect: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=failed`,

      client: {
        email: customerEmail,
        full_name: customerName || 'Kabo Merchant',
      },
      purchase: {
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'MYR',
        products: [
          {
            name: 'Kabo Subscription', // Change this to your actual plan name
            price: amountInCents,
          },
        ],
      },
    }

    // 4. Send the request to CHIP's API
    const response = await fetch('https://gate.chip-in.asia/api/v1/purchases/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHIP_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('CHIP API Error:', data)
      return NextResponse.json({ error: 'Failed to initiate payment gateway' }, { status: 500 })
    }

    // 5. Return the hosted checkout URL to your frontend
    return NextResponse.json({ checkoutUrl: data.checkout_url })

  } catch (error: any) {
    console.error('Checkout API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}