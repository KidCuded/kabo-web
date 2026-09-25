// app/api/wallet/update-class/route.ts
import { NextResponse } from 'next/server'
import { JWT } from 'google-auth-library'

export async function POST(request: Request) {
  try {
    const { businessId, storeName, logoUrl, heroImageUrl, passBgColor } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId.replace(/-/g, '')}`

    const credentials = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    // Define the updated template layout
    const patchBody: any = {
      issuerName: storeName,
      programName: storeName,
      hexBackgroundColor: passBgColor,
    }

    // Only attach images if they exist, otherwise Google throws an error
    if (logoUrl) {
      patchBody.programLogo = { sourceUri: { uri: logoUrl }, description: 'Logo' }
    }
    
    if (heroImageUrl) {
      patchBody.heroImage = { sourceUri: { uri: heroImageUrl }, description: 'Hero Banner' }
    }

    const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`
    
    // Push the update to Google
    const response = await credentials.request({
      url,
      method: 'PATCH',
      data: patchBody,
    })

    return NextResponse.json({ success: true, data: response.data })

  } catch (error: any) {
    // If the Class doesn't exist yet (e.g., brand new merchant who hasn't generated a pass), 
    // it will throw a 404. We catch it silently so it doesn't break the UI.
    console.error('Wallet Class Sync Skipped/Failed:', error.response?.data || error.message)
    return NextResponse.json({ success: false, reason: 'Class not found or error' }, { status: 200 })
  }
}