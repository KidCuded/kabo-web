// app/store/[businessId]/register/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { registerCustomer } from '@/app/actions/registerCustomer'

export default function CustomerRegistration() {
  const params = useParams()
  const businessId = params.businessId as string

  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!termsAccepted) return

    setIsSubmitting(true)
    setStatus(null)

    const formData = new FormData(event.currentTarget)
    formData.append('business_id', businessId)

    // Submits exactly what the user typed without formatting
    const result = await registerCustomer(formData)
    
    if (result.error) {
      setStatus({ error: result.error })
    } else {
      setStatus({ success: true })
    }
    setIsSubmitting(false)
  }

  if (status?.success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Registration Complete!</h2>
          <p className="text-base text-gray-400 mb-8">You are now enrolled in the rewards program.</p>
          <Link href={`/store/${businessId}`} className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-base transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans">
      
      <div className="bg-[#111318] border border-gray-800/80 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-5">
            <span className="font-black text-3xl">K</span>
          </div>
          <h1 className="text-sm font-bold text-white uppercase tracking-widest mb-2">
            Kabo Loyalty Programs
          </h1>
          <p className="text-sm text-gray-400 text-center">
            Sign up to join this business's loyalty program
          </p>
        </div>

        {status?.error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-4 rounded-xl mb-8 text-center font-medium">
            {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Full name <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="text" 
              name="name" 
              className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl px-4 py-2 text-white text-base focus:border-blue-500 focus:outline-none transition-colors" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="email" 
              name="email" 
              className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl px-4 py-2 text-white text-base focus:border-blue-500 focus:outline-none transition-colors" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Date of Birth (Optional)
            </label>
            <input 
              type="date" 
              name="date_of_birth" 
              className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl px-4 py-2 text-gray-300 text-base focus:text-white focus:border-blue-500 focus:outline-none transition-colors" 
            />
          </div>

          {/* Reverted Phone Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="tel" 
              name="phone_number"
              placeholder="0123456789"
              className="w-full bg-[#0a0c10] border border-gray-800 rounded-xl px-4 py-2 text-white text-base focus:border-blue-500 focus:outline-none transition-colors placeholder:text-gray-600" 
            />
          </div>

          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="terms"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-700 bg-[#0a0c10] text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs sm:text-sm text-gray-400 leading-relaxed cursor-pointer select-none">
              By signing up, you agree to our <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={!termsAccepted || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-xl text-base transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Join Program'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">
            © {new Date().getFullYear()} KABO. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}