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

async function isValidAuth(req: Request) {
  const headersList = await headers()
  let authHeader = headersList.get('authorization')
  const expectedToken = `ApplePass ${process.env.APPLE_WEB_SERVICE_AUTH_TOKEN}`
  return authHeader === expectedToken
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ apple: string[] }> }
) {
  const resolvedParams = await params
  const path = resolvedParams.apple

  if (path[0] === 'devices' && path[2] === 'registrations') {
    const isAuthorized = await isValidAuth(request)
    if (!isAuthorized) {
      return new NextResponse(null, { status: 401 })
    }

    const deviceLibraryIdentifier = path[1]
    const passTypeIdentifier = path[3]
    const serialNumber = path[4] // Customer ID

    console.log('Received Apple Wallet webhook POST request for deviceLibraryIdentifier:', deviceLibraryIdentifier, 'passTypeIdentifier:', passTypeIdentifier, 'serialNumber:', serialNumber)

    const body = await request.json()
    const pushToken = body.pushToken

    if (!pushToken) {
      return new NextResponse(null, { status: 400 })
    }

    const supabase = getSupabase()

    // 1. Fetch business_id from customers table
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('business_id')
      .eq('id', serialNumber)
      .single()

    if (customerError || !customer) {
      console.error('Customer not found for serial number:', serialNumber)
      return new NextResponse(null, { status: 404 })
    }

    // 2. Upsert registration with business_id included
    const { error } = await supabase
      .from('apple_wallet_registrations')
      .upsert(
        {
          business_id: customer.business_id,
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
  const isAuthorized = await isValidAuth(request)
  if (!isAuthorized) {
    return new NextResponse(null, { status: 401 })
  }

  const serialNumber = path[2] // customerId
  const supabase = getSupabase()

  // 1. Fetch customer details and the registration's updated_at timestamp
  const { data: customer } = await supabase
    .from('customers')
    .select('*, loyalty_balances(current_stamps)')
    .eq('id', serialNumber)
    .single()

  if (!customer) {
    return new NextResponse(null, { status: 404 })
  }

  // Get the newest updated_at from apple_wallet_registrations for this customer
  const { data: regData } = await supabase
    .from('apple_wallet_registrations')
    .select('updated_at')
    .eq('serial_number', serialNumber)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  const passLastUpdated = regData?.updated_at || customer.updated_at

  // 2. Evaluate if-modified-since against updated_at
  const ifModifiedSince = request.headers.get('if-modified-since')

  if (ifModifiedSince && passLastUpdated) {
    const deviceDate = new Date(ifModifiedSince).getTime()
    const dbDate = new Date(passLastUpdated).getTime()

    // Truncate to seconds matching HTTP header specs
    if (Math.floor(dbDate / 1000) <= Math.floor(deviceDate / 1000)) {
      return new NextResponse(null, { status: 304 })
    }
  }

  const loyaltyBalance = Array.isArray(customer.loyalty_balances)
    ? customer.loyalty_balances[0]
    : customer.loyalty_balances
  const currentStamps = loyaltyBalance?.current_stamps || 0

  // 3. Fetch fresh pass payload from 'api/wallet/apple/generate'
  const passResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/wallet/apple/generate?businessId=${customer.business_id}&customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&phoneNumber=${customer.phone_number}&currentStamps=${currentStamps}&lastUpdated=${encodeURIComponent(passLastUpdated)}`,
    { cache: 'no-store' }
  )

  if (!passResponse.ok) {
    return new NextResponse(null, { status: 500 })
  }

  const passArrayBuffer = await passResponse.arrayBuffer()

  console.log(`Returning Apple Wallet pass for customer ${serialNumber}, last updated: ${passLastUpdated}`)
  return new NextResponse(new Uint8Array(passArrayBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.apple.pkpass',
      'last-modified': new Date(passLastUpdated).toUTCString(),
    },
  })
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
    const isAuthorized = await isValidAuth(request)
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