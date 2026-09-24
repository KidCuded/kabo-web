// app/api/wallet/update/route.ts
import { NextResponse } from 'next/server'
import { JWT } from 'google-auth-library'

export async function POST(request: Request) {
  try {
    const { businessId, phoneNumber, newStampCount } = await request.json()

    if (!businessId || !phoneNumber || newStampCount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    
    // Reconstruct the exact Object ID we created during registration
    const objectId = `${issuerId}.${businessId.replace(/-/g, '')}-${phoneNumber.replace(/\D/g, '')}`

    // 1. Initialize the Auth Client (Same as Class creation)
    const credentials = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })

    // 2. Define the Patch Payload
    // We only send the fields that are changing. Google keeps the rest intact.
    const patchBody = {
      loyaltyPoints: {
        balance: { int: newStampCount },
        label: 'Stamps'
      }
    }

    // 3. Send the PATCH request to Google
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