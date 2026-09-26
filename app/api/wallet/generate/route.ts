// app/api/wallet/generate/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { businessId, customerId, customerName, phoneNumber, currentStamps } = await request.json()

    // 1. Fetch the LATEST branding from Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: business } = await supabase
      .from('businesses')
      .select('store_name, logo_url, wallet_hero_url, pass_bg_color')
      .eq('id', businessId)
      .single()

    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    
    const classId = `${issuerId}.${businessId.replace(/-/g, '')}`
    const objectId = `${issuerId}.${businessId.replace(/-/g, '')}-${phoneNumber.replace(/\D/g, '')}`

    const claims = {
      iss: process.env.GOOGLE_CLIENT_EMAIL,
      aud: 'google',
      typ: 'savetowallet',
      iat: Math.floor(Date.now() / 1000),
      payload: {
        loyaltyClasses: [{
          id: classId,
          issuerName: business?.store_name || 'Loyalty Program',
          programName: business?.store_name || 'Loyalty Program',
          hexBackgroundColor: business?.pass_bg_color || '#000000',
          reviewStatus: 'UNDER_REVIEW', // Required by Google to render rich assets
          
          programLogo: business?.logo_url ? {
            sourceUri: { uri: business.logo_url },
            // Google strictly requires this exact contentDescription structure
            contentDescription: {
              defaultValue: { language: 'en-US', value: 'Store Logo' }
            }
          } : undefined,

          heroImage: business?.wallet_hero_url ? {
            sourceUri: { uri: business.wallet_hero_url },
            contentDescription: {
              defaultValue: { language: 'en-US', value: 'Hero Banner' }
            }
          } : undefined,
        }],
        loyaltyObjects: [{
          id: objectId,
          classId: classId,
          state: 'ACTIVE',
          accountId: phoneNumber,
          accountName: customerName,
          barcode: {
            type: 'qrCode',
            value: phoneNumber,
            alternateText: phoneNumber
          },
          loyaltyPoints: {
            balance: { int: currentStamps || 0 }, 
            label: 'Stamps'
          }
        }]
      }
    }

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    if (!privateKey) throw new Error('Missing Google Private Key')

    const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' })
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`

    return NextResponse.json({ saveUrl })

  } catch (error) {
    console.error('Wallet Generation Error:', error)
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 })
  }
}