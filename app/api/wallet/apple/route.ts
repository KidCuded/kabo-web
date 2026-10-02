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

// Helper function to convert hex colors to Apple's required rgb string
const hexToRgb = (hex: string) => {
  hex = hex.replace(/^#/, '')
  // Handle 3-character shorthand hex (e.g., FFF)
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  const num = parseInt(hex, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  
  return `rgb(${r}, ${g}, ${b})`
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

    // 1. Initialize pass
    const pass = new PKPass({
      'pass.json': Buffer.from(JSON.stringify({
        formatVersion: 1,
        passTypeIdentifier: 'pass.my.kabo',
        serialNumber: customerId, // Customer UUID from Supabase
        teamIdentifier: parseEnv(process.env.APPLE_TEAM_ID),
        
        // Webhook communication endpoints
        webServiceURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/wallet/apple/webhook`,
        authenticationToken: process.env.APPLE_WEB_SERVICE_AUTH_TOKEN,

        organizationName: business.store_name,
        description: `${business.store_name} Loyalty Card`,
        logoText: business.store_name,
        backgroundColor: hexToRgb(business.pass_bg_color || '#1e293b'),
        foregroundColor: hexToRgb(business.pass_text_color || '#ffffff'),
        storeCard: {
          secondaryFields: [
            { key: 'stamps', label: 'STAMPS', value: currentStamps.toString() }
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

    // 3. Image buffer injection
    if (business.logo_url) {
      const logoBuffer = await fetchImageAsBuffer(business.logo_url)
      if (!logoBuffer) {
          throw new Error('Failed to fetch required store logo image.') 
      }
      pass.addBuffer('logo.png', logoBuffer)
      pass.addBuffer('logo@2x.png', logoBuffer)
      pass.addBuffer('icon.png', logoBuffer)
      pass.addBuffer('icon@2x.png', logoBuffer)
    }

    if (business.wallet_hero_url) {
      const stripBuffer = await fetchImageAsBuffer(business.wallet_hero_url)
      if (stripBuffer) {
        pass.addBuffer('strip.png', stripBuffer)
        pass.addBuffer('strip@2x.png', stripBuffer) // Good practice to include @2x for strips as well
      } 
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