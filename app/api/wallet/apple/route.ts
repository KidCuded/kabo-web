// app/api/wallet/apple/route.ts
import { NextResponse } from 'next/server'
import { PKPass } from 'passkit-generator'
import { createClient } from '@supabase/supabase-js'
import { generateStripBuffer } from '@/utils/generateStrip'

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
  console.log('GET Handler Triggered at:', new Date().toISOString())
  console.log("Creating Apple Pass....")
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const customerId = searchParams.get('customerId')
    const phoneNumber = searchParams.get('phoneNumber') || ''
    const currentStamps = parseInt(searchParams.get('currentStamps') || '0', 10)

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    
    // 1. Fetch from the unified Brand Kit
    const { data: businessData } = await supabase
      .from('businesses')
      .select(`
        store_name, 
        loyalty_rules (
          program_name,
          stamp_threshold
        ),
        business_customizations (
          logo_url, 
          primary_color, 
          secondary_color, 
          wallet_hero_image_url
        )
      `)
      .eq('id', businessId)
      .single()

    if (!businessData) throw new Error('Business not found')
    
    // Safely unwrap the joined custom data
    const custom = Array.isArray(businessData.business_customizations) 
      ? businessData.business_customizations[0] 
      : businessData.business_customizations

    // Safely unwrap the loyalty rules (Targeting index 0)
    const rule = Array.isArray(businessData.loyalty_rules)
    ? businessData.loyalty_rules[0]
    : businessData.loyalty_rules

    if (!custom?.logo_url) {
      throw new Error('Merchant must upload a Store Logo before generating Apple Wallet passes.')
    }

    // 2. Initialize pass with Unified Colors
    const pass = new PKPass(
      {
        'pass.json': Buffer.from(JSON.stringify({
          formatVersion: 1,
          passTypeIdentifier: 'pass.my.kabo', 
          serialNumber: customerId, 
          teamIdentifier: parseEnv(process.env.APPLE_TEAM_ID),
          
          webServiceURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/wallet/apple/webhook`,
          authenticationToken: process.env.APPLE_WEB_SERVICE_AUTH_TOKEN,

          organizationName: businessData?.store_name || 'My Store',
          description: `${businessData?.store_name || 'Store'} Loyalty Card`,
          logoText: businessData?.store_name || 'Rewards',
          
          backgroundColor: hexToRgb(custom.primary_color),
          foregroundColor: hexToRgb(custom.secondary_color),
          
          storeCard: {
            secondaryFields: [
              { 
                key: 'stamps', 
                label: 'STAMPS COLLECTED', 
                // Ensure it never evaluates to "undefined"
                value: String(`${currentStamps || 0} of ${rule?.stamp_threshold || 'N/A'}`)
              }
            ]
          }
        }))
      }, 
      {
        signerCert: parseEnv(process.env.APPLE_SIGNER_CERT),
        signerKey: parseEnv(process.env.APPLE_SIGNER_KEY),
        wwdr: parseEnv(process.env.APPLE_WWDR_CERT)
      }
    );

    // 3. Properly inject the barcode using passkit-generator's method
    if (phoneNumber) {
      pass.setBarcodes({
        message: phoneNumber,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
        altText: phoneNumber
      })
    }

    // 4. Image buffer injection
    if (custom.logo_url) {
      const logoBuffer = await fetchImageAsBuffer(custom.logo_url)
      if (!logoBuffer) {
          throw new Error('Failed to fetch required store logo image.') 
      }
      pass.addBuffer('logo.png', logoBuffer)
      pass.addBuffer('logo@2x.png', logoBuffer)
      pass.addBuffer('icon.png', logoBuffer)
      pass.addBuffer('icon@2x.png', logoBuffer)
    }

    console.log("Calling to generate strip....")

    // This checks for the raw uploaded hero image.
    try {
      console.log("Calling to generate strip....")
      const dynamicStripBuffer = await generateStripBuffer(businessId, currentStamps)
      pass.addBuffer('strip.png', dynamicStripBuffer)
      pass.addBuffer('strip@2x.png', dynamicStripBuffer)
    } catch (err) {
      console.error("Failed to generate Apple dynamic strip", err)
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