// app/api/wallet/apple/webhook/v1/[...apple]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Helper to validate the authorization header from Apple devices
function isValidAuth(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const expectedToken = `ApplePass ${process.env.APPLE_WEB_SERVICE_AUTH_TOKEN}`
  return authHeader === expectedToken
}

// Handle Device Registration (POST) & Pass Logging (POST)
export async function POST(
  request: Request,
  { params }: { params: { apple: string[] } }
) {
  const path = params.apple // e.g. ['devices', deviceId, 'registrations', passTypeId, serialNum] or ['log']

  // 1. Device Registration Request
  if (path[0] === 'devices' && path[2] === 'registrations') {
    if (!isValidAuth(request)) {
      return new NextResponse(null, { status: 401 })
    }

    const deviceLibraryIdentifier = path[1]
    const passTypeIdentifier = path[3]
    const serialNumber = path[4]

    const body = await request.json()
    const pushToken = body.pushToken

    if (!pushToken) {
      return new NextResponse(null, { status: 400 })
    }

    const supabase = getSupabase()

    // Upsert registration token linked to customer UUID (serialNumber)
    const { error } = await supabase
      .from('apple_wallet_registrations')
      .upsert(
        {
          customer_id: serialNumber,
          device_library_identifier: deviceLibraryIdentifier,
          push_token: pushToken,
          pass_type_identifier: passTypeIdentifier,
          serial_number: serialNumber,
        },
        { onConflict: 'device_library_identifier,serial_number' }
      )

    if (error) {
      console.error('Error saving Apple push token:', error)
      return new NextResponse(null, { status: 500 })
    }

    return new NextResponse(null, { status: 201 }) // 201 Created
  }

  // 2. Apple Wallet Client Error Logs
  if (path[0] === 'log') {
    const body = await request.json()
    console.log('Apple Wallet Client Log:', body)
    return new NextResponse(null, { status: 200 })
  }

  return new NextResponse(null, { status: 404 })
}

// Handle Unregistering Device Token when pass is deleted
export async function DELETE(
  request: Request,
  { params }: { params: { apple: string[] } }
) {
  const path = params.apple

  if (path[0] === 'devices' && path[2] === 'registrations') {
    if (!isValidAuth(request)) {
      return new NextResponse(null, { status: 401 })
    }

    const deviceLibraryIdentifier = path[1]
    const serialNumber = path[4]

    const supabase = getSupabase()
    await supabase
      .from('apple_wallet_registrations')
      .delete()
      .eq('device_library_identifier', deviceLibraryIdentifier)
      .eq('serial_number', serialNumber)

    return new NextResponse(null, { status: 200 })
  }

  return new NextResponse(null, { status: 404 })
}

// Handle Device Asking for Updated Passes or Latest .pkpass file
export async function GET(
  request: Request,
  { params }: { params: { apple: string[] } }
) {
  const path = params.apple

  // 1. iPhone asking: "Which serial numbers changed for this device?"
  if (path[0] === 'devices' && path[2] === 'registrations') {
    const deviceLibraryIdentifier = path[1]
    const passTypeIdentifier = path[3]

    const supabase = getSupabase()
    const { data } = await supabase
      .from('apple_wallet_registrations')
      .select('serial_number, created_at')
      .eq('device_library_identifier', deviceLibraryIdentifier)
      .eq('pass_type_identifier', passTypeIdentifier)

    if (!data || data.length === 0) {
      return new NextResponse(null, { status: 204 }) // No content
    }

    // Return array of updated serial numbers and modification tag
    return NextResponse.json({
      serialNumbers: data.map((row) => row.serial_number),
      lastUpdated: new Date().toISOString(),
    })
  }

  // 2. iPhone asking: "Send me the new .pkpass file for this serial number"
  if (path[0] === 'passes') {
    if (!isValidAuth(request)) {
      return new NextResponse(null, { status: 401 })
    }

    const serialNumber = path[2] // customer_id UUID
    const supabase = getSupabase()

    // Fetch customer and business details to generate updated pass
    const { data: customer } = await supabase
      .from('customers')
      .select('*, loyalty_balances(current_stamps)')
      .eq('id', serialNumber)
      .single()

    if (!customer) {
      return new NextResponse(null, { status: 404 })
    }

    const currentStamps = customer.loyalty_balances?.[0]?.current_stamps || 0

    // Fetch the updated pass buffer from your main Apple Pass generator endpoint
    const passResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/wallet/apple?businessId=${customer.business_id}&customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&phoneNumber=${customer.phone_number}&currentStamps=${currentStamps}`
    )

    if (!passResponse.ok) {
      return new NextResponse(null, { status: 500 })
    }

    const passArrayBuffer = await passResponse.arrayBuffer()

    return new NextResponse(new Uint8Array(passArrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
      },
    })
  }

  return new NextResponse(null, { status: 404 })
}