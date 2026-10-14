// app/api/wallet/apple/push/route.ts
// Receives POST requests from handlers that updates stamp amount and to update Apple Wallet passes
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAppleWalletPush } from '@/features/applePush';

export async function POST(request: Request) {
  try {
    const { customerId } = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // 1. Find registered Apple devices on the server
    const { data: devices, error } = await supabaseAdmin
      .from('apple_wallet_registrations')
      .select('push_token')
      .eq('customer_id', customerId);

    if (error) throw error;

    // 2. Fire pushes   
    if (devices && devices.length > 0) {
        await Promise.all(
            devices.map((device: { push_token: string }) => sendAppleWalletPush(device.push_token))
        );
        return NextResponse.json({ success: true, pushed: devices.length });
    }

    return NextResponse.json({ success: true, pushed: 0 });
    
  } catch (error) {
    console.error('Apple Push API Error:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}