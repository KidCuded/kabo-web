// app/dashboard/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = await createClient()
  
  // Tell Supabase to destroy the active session
  await supabase.auth.signOut()

  // Clear the Next.js cache so protected pages can't be navigated back to
  revalidatePath('/', 'layout')
  
  // Send the merchant back to the login page
  redirect('/login')
}