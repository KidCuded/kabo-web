// app/actions/subscription.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startFreeTrial(businessId: string) {
  const supabase = await createClient()
  
  // Calculate exactly 14 days from right now
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 14)

  const { error } = await supabase
    .from('businesses')
    .update({ 
      subscription_status: 'trialing',
      trial_ends_at: trialEndDate.toISOString()
    })
    .eq('id', businessId)
    .eq('subscription_status', 'inactive') // Security check: only allow if inactive

  if (error) throw new Error('Failed to start trial')

  // Refresh the dashboard to remove the lock screen
  revalidatePath('/dashboard', 'layout')
}