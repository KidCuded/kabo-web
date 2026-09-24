// app/api/wallet/generate/route.ts
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { businessId, phoneNumber, customerName } = await request.json()

    if (!businessId || !phoneNumber || !customerName) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 })
    }

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    
    // --- ROBUST PRIVATE KEY PARSING ---
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || ''
    
    // 1. Strip surrounding quotes if your .env file or hosting provider added them literally
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1)
    } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
      privateKey = privateKey.slice(1, -1)
    }
    
    // 2. Convert literal "\n" text into actual structural line breaks
    privateKey = privateKey.replace(/\\n/g, '\n')

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
              value: phoneNumber, // This is what the merchant will scan
              alternateText: phoneNumber
            },
            loyaltyPoints: {
              balance: { int: 0 }, 
              label: 'Stamps'
            }
          }
        ]
      }
    }

    // Sign the JWT with the properly formatted Private Key
    const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })
    
    // Construct the final actionable URL
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({ success: true, saveUrl })

  } catch (error: any) {
    console.error('JWT Generation Error:', error)
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 })
  }
}