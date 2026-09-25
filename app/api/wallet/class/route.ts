// app/api/wallet/class/route.ts
import { NextResponse } from 'next/server'
import { JWT } from 'google-auth-library'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessId, storeName, logoUrl, passBackgroundColor, heroImageUrl } = body

    if (!businessId || !storeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId.replace(/-/g, '')}` 

    const credentials = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    const loyaltyClass = {
      id: classId,
      issuerName: storeName,
      programName: storeName,
      hexBackgroundColor: passBackgroundColor,
      programLogo: logoUrl ? {
        sourceUri: { uri: logoUrl }
      } : undefined,
      // ADD THIS:
      heroImage: heroImageUrl ? {
        sourceUri: { uri: heroImageUrl },
        description: `${storeName} Banner`
      } : undefined,
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