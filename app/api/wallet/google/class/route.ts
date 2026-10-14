// app/api/wallet/update-class/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GoogleAuth } from 'google-auth-library'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const parseEnv = (val?: string) => {
  if (!val) return ''
  return val.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').trim()
}

export async function POST(request: Request) {
  try {
    const { businessId } = await request.json()
    if (!businessId) return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    
    // 1. Fetch Brand Kit and Loyalty Rules
    const { data: bData } = await supabase
      .from('businesses')
      .select(`
        store_name, 
        business_customizations (logo_url, primary_color, wallet_hero_image_url),
        loyalty_rules (program_name)
      `)
      .eq('id', businessId)
      .single()

    if (!bData) throw new Error('Business not found')

    const custom = Array.isArray(bData.business_customizations) ? bData.business_customizations[0] : bData.business_customizations
    const rules = Array.isArray(bData.loyalty_rules) ? bData.loyalty_rules[0] : bData.loyalty_rules
    const programName = rules?.program_name || `${bData.store_name} Rewards`

    // 2. Setup Google Auth
    const clientEmail = parseEnv(process.env.GOOGLE_CLIENT_EMAIL)
    const privateKey = parseEnv(process.env.GOOGLE_PRIVATE_KEY)
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID
    const classId = `${issuerId}.${businessId}`

    const auth = new GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
    })
    const client = await auth.getClient()

    // 3. Update the Global Class (Logo, Colors, Text)
    const loyaltyClass = {
      id: classId,
      issuerName: bData.store_name,
      programName: programName,
      programLogo: custom?.logo_url ? { sourceUri: { uri: custom.logo_url } } : undefined,
      reviewStatus: 'UNDER_REVIEW',
      hexBackgroundColor: custom?.primary_color || '#2563EB',
    }

    const classUrl = `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass`
    const checkRes = await client.request({ url: `${classUrl}/${classId}`, method: 'GET' }).catch(() => null)
    
    if (checkRes) {
      await client.request({ url: `${classUrl}/${classId}`, method: 'PUT', data: loyaltyClass })
    } else {
      await client.request({ url: classUrl, method: 'POST', data: loyaltyClass })
    }

    // 4. Force Update All Existing Customer Hero Images
    const { data: balances } = await supabase
      .from('loyalty_balances')
      .select('customer_id, current_stamps')
      .eq('business_id', businessId)

    if (balances && balances.length > 0) {
      const timestamp = Date.now() // Unique timestamp breaks Google's image cache
      
      const batchUpdates = balances.map(async (balance) => {
        const objectId = `${issuerId}.${balance.customer_id}`
        const updatePayload = {
          heroImage: {
            sourceUri: {
              uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/wallet/dynamic-strip?businessId=${businessId}&stamps=${balance.current_stamps}&v=${timestamp}`
            }
          }
        }
        
        // Execute patches concurrently, catching individual errors silently so one failure doesn't crash the loop
        return client.request({
          url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${objectId}`,
          method: 'PATCH',
          data: updatePayload
        }).catch(err => console.error(`Failed to patch object ${objectId}:`, err.message))
      })

      await Promise.all(batchUpdates)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('UPDATE CLASS ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}