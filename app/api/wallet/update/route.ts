// app/api/wallet/update/route.ts
import { NextResponse } from 'next/server'
import { JWT } from 'google-auth-library'

export async function POST(request: Request) {
  try {
    // 1. Accept the heroImageUrl as a new parameter
    const { businessId, phoneNumber, newStampCount, heroImageUrl } = await request.json()

    if (!businessId || !phoneNumber || newStampCount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const objectId = `${issuerId}.${businessId.replace(/-/g, '')}-${phoneNumber.replace(/\D/g, '')}`

    const credentials = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    // 2. Define the Patch Payload
    const patchBody: any = {
      loyaltyPoints: {
        balance: { int: newStampCount },
        label: 'Stamps'
      }
    }

    // 3. If a new dynamic hero image is provided, add it to the payload to override the Class
    if (heroImageUrl) {
      patchBody.heroImage = {
        sourceUri: { uri: heroImageUrl },
        description: `Stamp count ${newStampCount}`
      }
    }

    const url = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`
    
    const response = await credentials.request({
      url,
      method: 'PATCH',
      data: patchBody,
    })

    return NextResponse.json({ success: true, data: response.data })

  } catch (error: any) {
    console.error('Wallet Update Error:', error.response?.data || error.message)
    return NextResponse.json({ error: 'Failed to update Wallet pass' }, { status: 500 })
  }
}