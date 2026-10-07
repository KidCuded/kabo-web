// app/api/wallet/class/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { JWT } from 'google-auth-library'

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
    const credentials = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId}`  // Unique class per business

    // 3. Construct the Google Wallet LoyaltyClass payload
    const loyaltyClass = {
      id: classId,
      issuerName: businessData.store_name,
      programName: `${businessData.store_name} Rewards`,
      programLogo: {
        sourceUri: { uri: custom.logo_url }
      },
      reviewStatus: 'UNDER_REVIEW',
      hexBackgroundColor: custom.primary_color || '#2563EB', // Mapped to the unified Primary Color
      heroImage: custom.wallet_hero_image_url ? {
        sourceUri: { uri: custom.wallet_hero_image_url }
      } : undefined
    }

    const baseUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass'

    try {
      // 1. Attempt to CREATE the class
      const response = await credentials.request({
        url: baseUrl,
        method: 'POST',
        data: loyaltyClass,
      })
      return NextResponse.json({ success: true, classId, action: 'created', data: response.data })
      
    } catch (apiError: any) {
      // 2. If it already exists (409 Conflict), UPDATE the class instead
      if (apiError.response?.status === 409) {
        const updateUrl = `${baseUrl}/${classId}`
        
        const updateResponse = await credentials.request({
          url: updateUrl,
          method: 'PUT',
          data: loyaltyClass,
        })
        return NextResponse.json({ success: true, classId, action: 'updated', data: updateResponse.data })
      }
      
      // If it's a different error, throw it to the outer catch block
      throw apiError
    }

  } catch (error: any) {
    console.error('Google Wallet API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { error: 'Failed to manage Wallet Class', details: error.response?.data || error.message }, 
      { status: 500 }
    )
  }
}