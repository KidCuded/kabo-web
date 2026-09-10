// app/register/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function register(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const businessName = formData.get('businessName') as string

  // 1. Create the Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    return redirect(`/register?message=${authError.message}`)
  }

  // 2. Create the Business Profile & Default Rules
  if (authData.user && !authData.session) {
    // Insert the business record
    const { data: newBusiness, error: businessError } = await supabase
      .from('businesses')
      .insert([{ 
        auth_user_id: authData.user.id, 
        store_name: businessName 
      }])
      .select()
      .single()

    if (businessError) {
      return redirect('/register?message=check_email')
    }

    // Initialize default loyalty rules so the dashboard works instantly
    await supabase
      .from('loyalty_rules')
      .insert([{
        business_id: newBusiness.id,
        stamp_threshold: 10,
        reward_description: 'Free Reward'
      }])
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}