// app/actions/registerCustomer.ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'

const supabaseAdmin = createAdminClient()

export async function registerCustomer(formData: FormData) {
  const business_id = formData.get('business_id') as string
  const phone_number = formData.get('phone_number') as string
  const newName = formData.get('name') as string
  const newEmail = (formData.get('email') as string) || null
  const newDob = (formData.get('date_of_birth') as string) || null

  // 1. Check if the customer already exists
  const { data: existingCustomer, error: searchError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('business_id', business_id)
    .eq('phone_number', phone_number)
    .maybeSingle()

  if (searchError) {
    return { error: 'Database error. Please try again.' }
  }

  // 2. IF CUSTOMER EXISTS: Safe "Fill-in-the-blanks" Update
  if (existingCustomer) {
    // Check if the existing profile is actually missing information
    const needsUpdate = !existingCustomer.email || !existingCustomer.date_of_birth

    if (!needsUpdate) {
      // Profile is already fully populated. Block the overwrite.
      return { error: 'This phone number is already fully registered.' }
    }

    // Only update fields that were previously empty
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        // Keep the original name if it exists, otherwise update it
        name: existingCustomer.name && existingCustomer.name !== 'Valued Customer' 
              ? existingCustomer.name 
              : newName,
        email: existingCustomer.email || newEmail,
        date_of_birth: existingCustomer.date_of_birth || newDob,
      })
      .eq('id', existingCustomer.id)

    if (updateError) {
      return { error: 'Failed to update existing profile.' }
    }

    // Pass the existing customer UUID back to the frontend
    return { success: true, customer_id: existingCustomer.id }
  }

  // 3. IF CUSTOMER DOES NOT EXIST: Standard Insertion
  const { data: newCustomer, error: insertError } = await supabaseAdmin
    .from('customers')
    .insert({
      business_id,
      phone_number,
      name: newName,
      email: newEmail,
      date_of_birth: newDob,
      total_spent: 0
    })
    .select()
    .single()

  if (insertError) {
    return { error: 'Failed to create customer profile. Please try again.' }
  }

  // 4. Initialize their loyalty balance
  const { error: balanceError } = await supabaseAdmin
    .from('loyalty_balances')
    .insert({
      customer_id: newCustomer.id,
      business_id: business_id,
      current_stamps: 0
    })

  if (balanceError) {
    return { error: 'Profile created, but failed to initialize loyalty balance.' }
  }

  // Pass the newly generated customer UUID back to the frontend
  return { success: true, customer_id: newCustomer.id }
}