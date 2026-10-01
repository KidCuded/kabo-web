// app/api/wallet/apple/route.ts
import { NextResponse } from 'next/server'
import { PKPass } from 'passkit-generator'
import { createClient } from '@supabase/supabase-js'

// FIX 1: Force Vercel to never cache this route
export const dynamic = 'force-dynamic' 

async function fetchImageAsBuffer(url: string) {
  const response = await fetch(url)
  if (!response.ok) return null
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// FIX 2: A robust parser to clean up Vercel environment variables
const parseCert = (certStr?: string) => {
  if (!certStr) return ''
  // Remove accidental quotes Vercel might add, and fix all linebreaks
  return certStr.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const customerId = searchParams.get('customerId')
    const customerName = searchParams.get('customerName') || 'Valued Customer'
    const phoneNumber = searchParams.get('phoneNumber') || ''
    const currentStamps = parseInt(searchParams.get('currentStamps') || '0', 10)

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: business } = await supabase
      .from('businesses')
      .select('store_name, pass_bg_color, pass_text_color, logo_url, wallet_hero_url')
      .eq('id', businessId)
      .single()

    if (!business) throw new Error('Business not found')

    // FIX 3: Safety check - Apple WILL reject the pass if icon is missing
    if (!business.logo_url) {
      throw new Error('Merchant must upload a Store Logo before generating Apple Wallet passes.')
    }

    const pass = new PKPass({
      'pass.json': Buffer.from(JSON.stringify({
        passTypeIdentifier: 'pass.my.kabo', // Keep your actual ID here
        teamIdentifier: process.env.APPLE_TEAM_ID,
        organizationName: business.store_name,
        description: `${business.store_name} Loyalty Card`,
        logoText: business.store_name,
        backgroundColor: business.pass_bg_color || '#1e293b',
        foregroundColor: business.pass_text_color || '#ffffff',
        formatVersion: 1,
        storeCard: {
          primaryFields: [
            { key: 'stamps', label: 'STAMPS', value: currentStamps.toString() }
          ],
          secondaryFields: [
            { key: 'customer', label: 'MEMBER', value: customerName }
          ]
        },
        barcode: {
          message: phoneNumber,
          format: 'PKBarcodeFormatQR',
          messageEncoding: 'iso-8859-1'
        }
      })),
    }, {
      // Using the robust Vercel parser
      signerCert: parseCert(process.env.APPLE_SIGNER_CERT),
      signerKey: parseCert(process.env.APPLE_SIGNER_KEY),
      wwdr: parseCert(process.env.APPLE_WWDR_CERT)
    })

    if (business.logo_url) {
      const logoBuffer = await fetchImageAsBuffer(business.logo_url)
      if (logoBuffer) {
        pass.addBuffer('logo.png', logoBuffer)
        pass.addBuffer('icon.png', logoBuffer)
      }
    }

    if (business.wallet_hero_url) {
      const stripBuffer = await fetchImageAsBuffer(business.wallet_hero_url)
      if (stripBuffer) pass.addBuffer('strip.png', stripBuffer) 
    }

    const passBuffer = await pass.getAsBuffer()

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': 'attachment; filename="loyalty.pkpass"'
      }
    })

  } catch (error: any) {
    // This logs the true error to your Vercel Dashboard
    console.error('CRITICAL APPLE WALLET ERROR:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate Apple Pass' }, { status: 500 })
  }
}