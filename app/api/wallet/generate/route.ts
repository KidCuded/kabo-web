// app/api/wallet/generate/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { businessId, customerName, phoneNumber } = await request.json()

    if (!businessId || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    
    // 1. Fetch Customer Data
    const { data: customerData } = await supabase
      .from('customers')
      .select(`id, loyalty_balances ( current_stamps )`)
      .eq('phone_number', phoneNumber)
      .eq('loyalty_balances.business_id', businessId)
      .single()

    if (!customerData) throw new Error('Customer profile not found.')

    const balances = Array.isArray(customerData.loyalty_balances) 
      ? customerData.loyalty_balances[0] 
      : customerData.loyalty_balances
      
    const currentStamps = balances?.current_stamps || 0
    const customerId = customerData.id

    // 2. Fetch the Unified Brand Kit to build the Class on the fly
    const { data: businessData } = await supabase
      .from('businesses')
      .select(`
        store_name, 
        business_customizations ( logo_url, primary_color, wallet_hero_image_url )
      `)
      .eq('id', businessId)
      .single()

    if (!businessData) throw new Error('Business not found')
    
    const custom = Array.isArray(businessData.business_customizations) 
      ? businessData.business_customizations[0] 
      : businessData.business_customizations


    // Helper to correctly parse environment variables
    const parseEnv = (val?: string) => {
      if (!val) return ''
      return val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim()
    }

    // 3. Setup Google Auth
    const clientEmail = parseEnv(process.env.GOOGLE_CLIENT_EMAIL)
    const privateKey = parseEnv(process.env.GOOGLE_PRIVATE_KEY)
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId}`
    const objectId = `${issuerId}.${customerId}`

    // 4. Define the Global Brand Class (This prevents the "Missing Class" error!)
    const loyaltyClass = {
      id: classId,
      issuerName: businessData.store_name,
      programName: `${businessData.store_name} Rewards`,
      programLogo: custom?.logo_url ? { sourceUri: { uri: custom.logo_url } } : undefined,
      reviewStatus: 'UNDER_REVIEW',
      hexBackgroundColor: custom?.primary_color || '#2563EB',
      heroImage: custom?.wallet_hero_image_url ? { sourceUri: { uri: custom.wallet_hero_image_url } } : undefined
    }

    // 5. Define the specific Customer's LoyaltyObject
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
        value: phoneNumber,
        alternateText: phoneNumber
      },
      // Override the hero image to point to our new dynamic Canvas engine
      heroImage: {
        sourceUri: {
          uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/wallet/dynamic-strip?businessId=${businessId}&stamps=${currentStamps}&v=${Date.now()}`
        }
      }
    }

    // 6. Generate the JWT Save Link (Atomic Payload)
    const claims = {
      iss: clientEmail,
      aud: 'google',
      origins: [process.env.NEXT_PUBLIC_SITE_URL],
      typ: 'savetowallet',
      payload: {
        loyaltyClasses: [loyaltyClass], // By including this, Google auto-creates it if missing
        loyaltyObjects: [loyaltyObject]
      }
    }

    //console.log("DEBUG CLAIMS PAYLOAD:", JSON.stringify(claims, null, 2))

    const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({ success: true, saveUrl })

  } catch (error: any) {
    console.error('GOOGLE WALLET GENERATE ERROR FULL:', JSON.stringify(error, null, 2))
    console.error('GOOGLE WALLET GENERATE ERROR MESSAGE:', error.message)
    return NextResponse.json({ error: error.message || 'Failed to generate Google Wallet link' }, { status: 500 })
  }
}