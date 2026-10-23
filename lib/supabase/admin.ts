import { createClient } from '@supabase/supabase-js'

// Service-role client: bypasses Row Level Security. Only use in server code
// (API routes, server actions), never in a 'use client' component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
