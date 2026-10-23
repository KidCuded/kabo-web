// app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Authenticate via Supabase Auth API
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Redirect back to login with an error message
    redirect('/login?message=Invalid email or password')
  }

  // Clear the router cache and establish the web session
  revalidatePath('/', 'layout')
  
  // Redirect browser to the counter dashboard
  redirect('/dashboard')
}