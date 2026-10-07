// app/api/wallet/generate/route.ts
import { NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { businessId, customerName, phoneNumber } = await request.json()

    if (!businessId || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Look up the customer's UUID and current stamps securely via service role
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: customerData } = await supabase
      .from('customers')
      .select(`id, loyalty_balances ( current_stamps )`)
      .eq('phone_number', phoneNumber)
      .eq('loyalty_balances.business_id', businessId)
      .single()

    if (!customerData) throw new Error('Customer profile not found for pass generation.')

    const balances = Array.isArray(customerData.loyalty_balances) 
      ? customerData.loyalty_balances[0] 
      : customerData.loyalty_balances
      
    const currentStamps = balances?.current_stamps || 0
    const customerId = customerData.id // The unique UUID

    // 2. Setup Google Auth
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId}`
    const objectId = `${issuerId}.${customerId}`

    // 3. Define the specific Customer's LoyaltyObject
    const loyaltyObject = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      accountId: customerId,
      accountName: customerName,
      loyaltyPoints: {
        balance: { string: currentStamps.toString() },
        label: 'STAMPS'
      },
      barcode: {
        type: 'qrCode',
        value: phoneNumber, // The scanner reads their phone number
        alternateText: phoneNumber
      }
    }

    // 4. Generate the JWT Save Link
    // Google requires signing a JWT containing the object to generate the "Add to Wallet" button URL
    const claims = {
      iss: process.env.GOOGLE_CLIENT_EMAIL,
      aud: 'google',
      origins: [process.env.NEXT_PUBLIC_SITE_URL],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [loyaltyObject]
      }
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    if (!privateKey) throw new Error('Missing Google Private Key')

    const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({ success: true, saveUrl })

  } catch (error: any) {
    console.error('GOOGLE WALLET GENERATE ERROR:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate Google Wallet link' }, { status: 500 })
  }
}