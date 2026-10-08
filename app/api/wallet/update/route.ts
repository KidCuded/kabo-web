// app/api/wallet/update/route.ts
import { NextResponse } from 'next/server'
import { pushGoogleWalletUpdate } from '@/utils/updateGooglePass'

export async function POST(request: Request) {
  try {
    const { businessId, customerId, newStampCount } = await request.json()

    if (!businessId || !customerId || newStampCount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Trigger the PATCH request to Google's servers
    await pushGoogleWalletUpdate(businessId, customerId, newStampCount)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('WALLET UPDATE ROUTE ERROR:', error)
    return NextResponse.json({ error: 'Failed to sync wallet update' }, { status: 500 })
  }
}