// app/register/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  
  // Gets the current domain (e.g., https://www.kabo.my or http://localhost:3000)
  const origin = (await headers()).get('origin')  || 'https://www.kabo.my'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Supabase verifies the user, generates the valid PKCE code, 
      // and appends it to this exact URL before redirecting.
      emailRedirectTo: `${origin}/auth/callback?next=/login`,
    },
  })

  if (error) {
    return redirect(`/register?message=${error.message}`)
  }

  return redirect('/register?message=check_email')
}