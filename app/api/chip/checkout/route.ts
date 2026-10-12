// app/api/chip/checkout/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Extract the data sent from the frontend checkout button
    const body = await request.json()
    
    // Adjust these destructured variables based on what your frontend actually sends
    const { businessId, planId, customerEmail, customerName } = body

    if (!businessId || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Determine the price
    // Subscription is RM 150.00
    const amount = 150.00 
    // CHIP requires all prices in cents (e.g., RM 150.00 = 15000)
    const amountInCents = Math.round(amount * 100)

    // 3. Build the CHIP Purchase Payload
    const payload = {
      brand_id: process.env.CHIP_BRAND_ID,
      reference: businessId,
      
      // Updated paths to return directly to /dashboard/subscription
      success_redirect: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?payment=success`,
      failure_redirect: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/subscription?payment=failed`,

      client: {
        email: customerEmail,
        full_name: customerName || 'Kabo Merchant',
      },
      purchase: {
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'MYR',
        products: [
          {
            name: 'Kabo Loyalty Subscription',
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
        'Authorization': `Bearer ${process.env.CHIP_API_KEY}`, // Use CHIP_API_KEY for production
        //'Authorization': `Bearer ${process.env.CHIP_API_KEY_TEST}`,
      },
      body: JSON.stringify(payload),
    })

    console.log(`CHIP Checkout API Response Status: ${response.status}`)

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