// app/onboarding/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [storeName, setStoreName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    // This insert works because the user is logged in and verified!
    const { error } = await supabase.from('businesses').insert([
      {
        auth_user_id: userData.user.id,
        store_name: storeName,
      },
    ])

    if (!error) {
      router.push('/dashboard')
    } else {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Name your store</h2>
        <p className="text-gray-600 mb-6">What should your customers see on their digital stamp cards?</p>
        
        <form onSubmit={handleCreateStore} className="space-y-4">
          <input
            type="text"
            required
            placeholder="e.g., Kopi Kampung"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Setting up...' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}