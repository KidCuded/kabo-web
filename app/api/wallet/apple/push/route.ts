// app/api/wallet/apple/push/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAppleWalletPush } from '@/lib/wallet/applePush';

export async function POST(request: Request) {
  try {
    const { customerId, businessId } = await request.json();

    if (!customerId && !businessId) {
      return NextResponse.json({ error: 'Missing customerId or businessId' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    const now = new Date().toISOString();

    // 1. Touch updated_at on registrations so Apple Webhook detects a fresh modification date
    if (businessId) {
      await supabaseAdmin
        .from('apple_wallet_registrations')
        .update({ updated_at: now })
        .eq('business_id', businessId);
    } else if (customerId) {
      await supabaseAdmin
        .from('apple_wallet_registrations')
        .update({ updated_at: now })
        .eq('customer_id', customerId);
    }

    // 2. Query devices
    let query = supabaseAdmin.from('apple_wallet_registrations').select('push_token');
    if (businessId) {
      query = query.eq('business_id', businessId);
    } else if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: devices, error } = await query;
    if (error) throw error;

    // 3. Fire pushes to unique tokens
    if (devices && devices.length > 0) {
      const uniqueTokens = Array.from(new Set(devices.map((d: { push_token: string }) => d.push_token)));
      await Promise.all(uniqueTokens.map((token: string) => sendAppleWalletPush(token)));
      return NextResponse.json({ success: true, pushed: uniqueTokens.length });
    }

    return NextResponse.json({ success: true, pushed: 0 });

  } catch (error: any) {
    console.error('Apple Push API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send push' }, { status: 500 });
  }
}