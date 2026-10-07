// app/api/wallet/class/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleAuth } from 'google-auth-library'

export async function POST(request: Request) {
  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    // 1. Fetch the Unified Brand Kit from Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: businessData } = await supabase
      .from('businesses')
      .select(`
        store_name, 
        business_customizations (
          logo_url, 
          primary_color, 
          secondary_color, 
          wallet_hero_image_url
        )
      `)
      .eq('id', businessId)
      .single()

    if (!businessData) throw new Error('Business not found')
    
    const custom = Array.isArray(businessData.business_customizations) 
      ? businessData.business_customizations[0] 
      : businessData.business_customizations

    if (!custom?.logo_url) {
      throw new Error('Merchant must upload a Store Logo before syncing to Google Wallet.')
    }

    // 2. Authenticate with Google Wallet API
    const auth = new GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}'),
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })
    const client = await auth.getClient()
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId}` // Unique class per business

    // 3. Construct the Google Wallet LoyaltyClass payload
    const loyaltyClass = {
      id: classId,
      issuerName: businessData.store_name,
      programName: {
        defaultValue: { language: 'en-US', value: `${businessData.store_name} Rewards` }
      },
      programLogo: {
        sourceUri: { uri: custom.logo_url }
      },
      reviewStatus: 'UNDER_REVIEW',
      hexBackgroundColor: custom.primary_color || '#2563EB', // Mapped to the unified Primary Color
      heroImage: custom.wallet_hero_image_url ? {
        sourceUri: { uri: custom.wallet_hero_image_url }
      } : undefined
    }

    // 4. Upsert the Class to Google
    const classUrl = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass`
    
    // First, check if it exists
    const checkRes = await client.request({ url: `${classUrl}/${classId}`, method: 'GET' }).catch(() => null)
    
    if (checkRes) {
      // Update existing class
      await client.request({ url: `${classUrl}/${classId}`, method: 'PUT', data: loyaltyClass })
    } else {
      // Create new class
      await client.request({ url: classUrl, method: 'POST', data: loyaltyClass })
    }

    return NextResponse.json({ success: true, classId })

  } catch (error: any) {
    console.error('GOOGLE WALLET CLASS ERROR:', error)
    return NextResponse.json({ error: error.message || 'Failed to sync Google Wallet Class' }, { status: 500 })
  }
}