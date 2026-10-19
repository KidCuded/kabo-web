// app/api/wallet/dynamic-strip/route.ts
import { NextResponse } from 'next/server'
import { generateStripBuffer } from '@/utils/generateStrip'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  console.log("Sending request to generate strip")
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const stamps = parseInt(searchParams.get('stamps') || '0', 10)

    if (!businessId) return new NextResponse('Missing businessId', { status: 400 })

    const buffer = await generateStripBuffer(businessId, stamps)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0' 
      }
    })
  } catch (error) {
    console.error('Dynamic Strip Error:', error)
    return new NextResponse('Failed to generate image', { status: 500 })
  }
}