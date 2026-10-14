// app/api/wallet/apple/push/route.ts
// Receives POST requests from handlers that updates stamp amount and to update Apple Wallet passes
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppleWalletPush } from '@/features/applePush';

export async function POST(request: Request) {
  try {
    const { customerId, businessId } = await request.json();

    // 1. Guard against missing params to prevent invalid UUID errors
    if (!customerId && !businessId) {
      return NextResponse.json(
        { error: 'Missing customerId or businessId' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // 2. Query devices dynamically based on provided parameter
    let query = supabaseAdmin.from('apple_wallet_registrations').select('push_token');

    if (businessId) {
      // Global broadcast for brand or settings changes
      query = query.eq('business_id', businessId);
    } else if (customerId) {
      // Specific push for stamp updates
      query = query.eq('customer_id', customerId);
    }

    const { data: devices, error } = await query;

    if (error) throw error;

    // 3. Fire pushes to unique tokens
    if (devices && devices.length > 0) {
      // Deduplicate push tokens in case a device registered multiple times
      const uniqueTokens = Array.from(new Set(devices.map((d: { push_token: string }) => d.push_token)));

      await Promise.all(
        uniqueTokens.map((token: string) => sendAppleWalletPush(token))
      );

      return NextResponse.json({ success: true, pushed: uniqueTokens.length });
    }

    return NextResponse.json({ success: true, pushed: 0 });
    
  } catch (error: any) {
    console.error('Apple Push API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send push' }, { status: 500 });
  }
}