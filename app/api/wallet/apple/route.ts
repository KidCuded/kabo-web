// app/api/wallet/apple/route.ts
import { NextResponse } from 'next/server'
import { PKPass } from 'passkit-generator'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic' 

async function fetchImageAsBuffer(url: string) {
  const response = await fetch(url)
  if (!response.ok) return null
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

const parseEnv = (val?: string) => {
  if (!val) return ''
  return val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim()
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

    if (!business.logo_url) {
      throw new Error('Merchant must upload a Store Logo before generating Apple Wallet passes.')
    }

    // 1. Initialize pass WITHOUT the legacy barcode option
    const pass = new PKPass({
        'pass.json': Buffer.from(JSON.stringify({
            formatVersion: 1,
            passTypeIdentifier: 'pass.my.kabo',
            serialNumber: customerId || `temp-${Date.now()}`, // Added required serialNumber
            teamIdentifier: parseEnv(process.env.APPLE_TEAM_ID),
            organizationName: business.store_name,
            description: `${business.store_name} Loyalty Card`,
            logoText: business.store_name,
            backgroundColor: 'rgb(30, 41, 59)', // Converted to RGB format
            foregroundColor: 'rgb(255, 255, 255)', // Converted to RGB format
            storeCard: {
                primaryFields: [
                    { key: 'stamps', label: 'STAMPS', value: currentStamps.toString() }
                ],
                secondaryFields: [
                    { key: 'customer', label: 'MEMBER', value: customerName }
                ]
            }
        })),
    }, {
        signerCert: parseEnv(process.env.APPLE_SIGNER_CERT),
        signerKey: parseEnv(process.env.APPLE_SIGNER_KEY),
        wwdr: parseEnv(process.env.APPLE_WWDR_CERT)
    })
    // 2. Properly inject the barcode using passkit-generator's method
    if (phoneNumber) {
      pass.setBarcodes({
        message: phoneNumber,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: phoneNumber
      })
    }

    // 2. Corrected image buffer injection
    if (business.logo_url) {
    const logoBuffer = await fetchImageAsBuffer(business.logo_url)
    if (!logoBuffer) {
        // Throw an error instead of silently building an invalid pass without an icon
        throw new Error('Failed to fetch required store logo image.') 
    }
    pass.addBuffer('logo.png', logoBuffer)
    pass.addBuffer('logo@2x.png', logoBuffer)
    pass.addBuffer('icon.png', logoBuffer)
    pass.addBuffer('icon@2x.png', logoBuffer) // Added required Retina icon
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
    console.error('CRITICAL APPLE WALLET ERROR:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate Apple Pass' }, { status: 500 })
  }
}