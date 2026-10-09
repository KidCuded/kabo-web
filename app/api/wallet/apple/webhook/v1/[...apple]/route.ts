// app/api/wallet/apple/webhook/v1/[...apple]/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function isValidAuth() {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  const expectedToken = `ApplePass ${process.env.APPLE_WEB_SERVICE_AUTH_TOKEN}`

  // Temporary diagnostic logs
  console.log('--- AUTH DIAGNOSTICS ---')
  console.log('1. Received Header:', authHeader)
  console.log('2. Expected Token:', expectedToken)
  console.log('3. Exact Match:', authHeader === expectedToken)
  console.log('------------------------')

  return authHeader === expectedToken
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ apple: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.apple

  if (path[0] === 'devices' && path[2] === 'registrations') {
    const isAuthorized = await isValidAuth()
    if (!isAuthorized) {
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

    return new NextResponse(null, { status: 201 })
  }

  if (path[0] === 'log') {
    const body = await request.json()
    console.log('Apple Wallet Client Log:', body)
    return new NextResponse(null, { status: 200 })
  }

  return new NextResponse(null, { status: 404 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ apple: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.apple

  if (path[0] === 'devices' && path[2] === 'registrations') {
    const isAuthorized = await isValidAuth()
    if (!isAuthorized) {
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ apple: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.apple

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
      return new NextResponse(null, { status: 204 })
    }

    return NextResponse.json({
      serialNumbers: data.map((row) => row.serial_number),
      lastUpdated: new Date().toISOString(),
    })
  }

  if (path[0] === 'passes') {
    const isAuthorized = await isValidAuth()
    if (!isAuthorized) {
      return new NextResponse(null, { status: 401 })
    }

    const serialNumber = path[2] 
    const supabase = getSupabase()

    const { data: customer } = await supabase
      .from('customers')
      .select('*, loyalty_balances(current_stamps)')
      .eq('id', serialNumber)
      .single()

    if (!customer) {
      return new NextResponse(null, { status: 404 })
    }

    const currentStamps = customer.loyalty_balances?.[0]?.current_stamps || 0

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