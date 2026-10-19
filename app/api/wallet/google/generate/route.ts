// app/api/wallet/google/generate/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'


// Helper to correctly parse multi-line PEM keys from environment variables
const parseEnv = (val?: string) => {
  if (!val) return ''
  return val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim()
}

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

    if (!customerData) throw new Error('Customer profile not found for pass generation.')

    // 2. Fetch Business Customizations and Loyalty Rules
    const { data: businessData } = await supabase
      .from('businesses')
      .select(`
        store_name,
        business_customizations (logo_url, primary_color, wallet_hero_image_url),
        loyalty_rules (program_name, stamp_threshold, reward_description)
      `)
      .eq('id', businessId)
      .single()
      
    if (!businessData) throw new Error('Business not found')

    // Safely unwrap joined data
    const balances = Array.isArray(customerData.loyalty_balances) 
      ? customerData.loyalty_balances[0] 
      : customerData.loyalty_balances
    const custom = Array.isArray(businessData.business_customizations) 
      ? businessData.business_customizations[0] 
      : businessData.business_customizations
    const rules = Array.isArray(businessData.loyalty_rules) 
      ? businessData.loyalty_rules[0] 
      : businessData.loyalty_rules
      
    const currentStamps = balances?.current_stamps || 0
    const threshold = rules?.stamp_threshold || 10
    const customerId = customerData.id
    console.log(`Generating Google Wallet pass for program: ${rules?.program_name}`)

    const programName = rules?.program_name || `${businessData.store_name} Rewards`

    // 3. Setup Google Auth & Identifiers
    const clientEmail = parseEnv(process.env.GOOGLE_CLIENT_EMAIL)
    const privateKey = parseEnv(process.env.GOOGLE_PRIVATE_KEY)
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId}`
    const objectId = `${issuerId}.${customerId}`

    // 4. Define Loyalty Class (Global Template)
    const loyaltyClass = {
      id: classId,
      issuerName: businessData.store_name,
      programName: programName, // Mapped as a strict scalar string to prevent API errors
      programLogo: custom?.logo_url ? { sourceUri: { uri: custom.logo_url } } : undefined,
      reviewStatus: 'UNDER_REVIEW',
      hexBackgroundColor: custom?.primary_color || '#2563EB',
      heroImage: custom?.wallet_hero_image_url ? {
        sourceUri: { uri: custom.wallet_hero_image_url }
      } : undefined,
      textModulesData: [
        {
          header: "Reward Goal",
          body: `Collect ${threshold} stamps to earn your reward!`
        },
        {
          header: "Reward Description",
          body: rules?.reward_description
        }
      ]
    }

    // 5. Define Loyalty Object (Customer Pass)
    const loyaltyObject = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      accountId: customerId,
      accountName: customerName,
      loyaltyPoints: {
        balance: { string: `${currentStamps}` },
        label: 'STAMPS'
      },
      barcode: {
        type: 'qrCode',
        value: phoneNumber,
        alternateText: phoneNumber
      },
      heroImage: {
        sourceUri: {
          // Dynamic image generation endpoint, cache busted with Date timestamp
          uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/wallet/dynamic-strip?businessId=${businessId}&stamps=${currentStamps}&v=${Date.now()}`
        }
      }
    }

    // 6. Generate the JWT Save Link
    const claims = {
      iss: clientEmail,
      aud: 'google',
      origins: [process.env.NEXT_PUBLIC_SITE_URL],
      typ: 'savetowallet',
      payload: {
        loyaltyObjects: [loyaltyObject]
      }
    }

    const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({ success: true, saveUrl })

  } catch (error: any) {
    console.error('GOOGLE WALLET GENERATE ERROR:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate Google Wallet link' }, { status: 500 })
  }
}