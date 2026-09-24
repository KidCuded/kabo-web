// app/api/wallet/generate/route.ts
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { businessId, phoneNumber, customerName } = await request.json()

    if (!businessId || !phoneNumber || !customerName) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 })
    }

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!issuerId || !clientEmail || !privateKey) {
      throw new Error('Missing Google Wallet credentials')
    }

    // Format the IDs exactly as Google expects: ISSUER_ID.UNIQUE_ID
    const classId = `${issuerId}.${businessId.replace(/-/g, '')}`
    const objectId = `${issuerId}.${businessId.replace(/-/g, '')}-${phoneNumber.replace(/\D/g, '')}`

    // Define the Customer's specific card (The Object)
    const claims = {
      iss: clientEmail,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      origins: [], // Leave empty to allow saving from any origin/app
      payload: {
        loyaltyObjects: [
          {
            id: objectId,
            classId: classId,
            state: 'ACTIVE',
            accountId: phoneNumber,
            accountName: customerName,
            barcode: {
              type: 'qrCode',
              value: phoneNumber, // This is what your scanner will read
              alternateText: phoneNumber
            },
            loyaltyPoints: {
              balance: { int: 0 }, // Starts at 0 upon registration
              label: 'Stamps'
            }
          }
        ]
      }
    }

    // Sign the JWT with your Google Private Key
    const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })
    
    // Construct the final actionable URL
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({ success: true, saveUrl })

  } catch (error: any) {
    console.error('JWT Generation Error:', error)
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 })
  }
}