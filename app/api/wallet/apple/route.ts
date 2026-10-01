// app/api/wallet/apple/route.ts
import { NextResponse } from 'next/server'
import { PKPass } from 'passkit-generator'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Helper function to download Supabase URLs as Buffers
async function fetchImageAsBuffer(url: string) {
  const response = await fetch(url)
  if (!response.ok) return null
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(request: Request) {
  try {
    const { businessId, customerId, customerName, phoneNumber, currentStamps } = await request.json()

    // 1. Fetch live branding from Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: business } = await supabase
      .from('businesses')
      .select('store_name, pass_bg_color, pass_text_color, logo_url, wallet_hero_url')
      .eq('id', businessId)
      .single()

    if (!business) throw new Error('Business not found')

    // 2. Load Certificates (Ensure your paths match where you saved them)
    const certPath = path.join(process.cwd(), 'certificates')
    const pass = new PKPass({
      'pass.json': Buffer.from(JSON.stringify({
        passTypeIdentifier: 'pass.com.yourdomain.loyalty', // MUST match your Apple portal ID
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
      // Provide an empty string fallback to satisfy TypeScript's strict string requirement
      signerCert: (process.env.APPLE_SIGNER_CERT || '').replace(/\\n/g, '\n'),
      signerKey: (process.env.APPLE_SIGNER_KEY || '').replace(/\\n/g, '\n'),
      wwdr: (process.env.APPLE_WWDR_CERT || '').replace(/\\n/g, '\n')
    })

    // 3. Download and attach remote Supabase images
    if (business.logo_url) {
      const logoBuffer = await fetchImageAsBuffer(business.logo_url)
      if (logoBuffer) {
        pass.addBuffer('logo.png', logoBuffer)
        pass.addBuffer('icon.png', logoBuffer) // Apple requires an icon.png, so we reuse the logo
      }
    }

    if (business.wallet_hero_url) {
      const stripBuffer = await fetchImageAsBuffer(business.wallet_hero_url)
      // Apple calls the hero banner a "strip"
      if (stripBuffer) pass.addBuffer('strip.png', stripBuffer) 
    }

    // 4. Generate & Return the file
    const passBuffer = await pass.getAsBuffer()

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': 'attachment; filename="loyalty.pkpass"'
      }
    })

  } catch (error: any) {
    console.error('Apple Wallet Error:', error)
    return NextResponse.json({ error: 'Failed to generate Apple Pass' }, { status: 500 })
  }
}