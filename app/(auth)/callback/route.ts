// app/(auth)/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // 1. Capture the 'next' parameter from the URL, defaulting to /login if missing
  const next = searchParams.get('next') ?? '/login'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 2. Safely redirect to the 'next' destination (e.g., /login)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Invalid or expired verification link`)
}