// app/store/[businessId]/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { registerCustomer } from '@/app/actions/registerCustomer'

// Expanded Theme Dictionary mapped to Tailwind classes
const ThemeStyles: Record<string, { bg: string; hoverBg: string; text: string; iconBg: string; iconText: string }> = {
  blue: { bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-500', text: 'text-white', iconBg: 'bg-blue-500/10', iconText: 'text-blue-500' },
  emerald: { bg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-500', text: 'text-white', iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-500' },
  rose: { bg: 'bg-rose-600', hoverBg: 'hover:bg-rose-500', text: 'text-white', iconBg: 'bg-rose-500/10', iconText: 'text-rose-500' },
  amber: { bg: 'bg-amber-600', hoverBg: 'hover:bg-amber-500', text: 'text-white', iconBg: 'bg-amber-500/10', iconText: 'text-amber-500' },
  dark: { bg: 'bg-white', hoverBg: 'hover:bg-gray-200', text: 'text-black', iconBg: 'bg-gray-800', iconText: 'text-white' },
  violet: { bg: 'bg-violet-600', hoverBg: 'hover:bg-violet-500', text: 'text-white', iconBg: 'bg-violet-500/10', iconText: 'text-violet-500' },
  cyan: { bg: 'bg-cyan-600', hoverBg: 'hover:bg-cyan-500', text: 'text-white', iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-500' },
  orange: { bg: 'bg-orange-600', hoverBg: 'hover:bg-orange-500', text: 'text-white', iconBg: 'bg-orange-500/10', iconText: 'text-orange-500' },
}

export default function CustomerRegistration() {
  const params = useParams()
  const businessId = params.businessId as string
  const supabase = createClient()

  // Form State
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Branding State
  const [storeName, setStoreName] = useState('Kabo Loyalty Programs')
  const [themeColor, setThemeColor] = useState('blue')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [bgPattern, setBgPattern] = useState('clean')

  useEffect(() => {
    async function fetchBranding() {
      if (!businessId) return
      
      const { data } = await supabase
        .from('businesses')
        .select('store_name, theme_color, bg_pattern, logo_url')
        .eq('id', businessId)
        .single()
      
      if (data) {
        if (data.store_name) setStoreName(data.store_name)
        if (data.theme_color) setThemeColor(data.theme_color)
        if (data.bg_pattern) setBgPattern(data.bg_pattern)
        if (data.logo_url) setLogoUrl(data.logo_url)
      }
    }
    fetchBranding()
  }, [businessId, supabase])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!termsAccepted) return

    setIsSubmitting(true)
    setStatus(null)

    const formData = new FormData(event.currentTarget)
    formData.append('business_id', businessId)

    const result = await registerCustomer(formData)
    
    if (result.error) {
      setStatus({ error: result.error })
    } else {
      setStatus({ success: true })
    }
    setIsSubmitting(false)
  }

  // Resolve dynamic branding styles
  const activeTheme = ThemeStyles[themeColor] || ThemeStyles.blue
  
  // Dark mode optimized patterns
  const getBackgroundClass = () => {
    if (bgPattern === 'dots') return 'bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] bg-[#050505]'
    if (bgPattern === 'grid') return 'bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] bg-[#050505]'
    return 'bg-black' // 'clean' default
  }

  if (status?.success) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center p-4 font-sans transition-colors duration-300`}>
        <div className="bg-[#111318] border border-gray-800/80 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Registration Complete!</h2>
          <p className="text-base text-gray-400 mb-8">You are now enrolled in the rewards program.</p>
          <Link 
            href={`/store/${businessId}`} 
            className={`block w-full ${activeTheme.bg} ${activeTheme.hoverBg} ${activeTheme.text} font-bold py-4 rounded-xl text-base transition-colors`}
          >
            Return to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300`}>
      
      <div className="bg-[#111318] border border-gray-800/80 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl relative">
        
        {/* Dynamic Header & Logo */}
        <div className="flex flex-col items-center mb-8">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={storeName} 
              className="w-16 h-16 object-contain rounded-xl mb-5 shadow-sm" 
            />
          ) : (
            <div className={`w-14 h-14 ${activeTheme.iconBg} ${activeTheme.iconText} rounded-2xl flex items-center justify-center mb-5`}>
              <span className="font-black text-3xl">{(storeName || 'K').charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h1 className="text-sm font-bold text-white uppercase tracking-widest mb-2 text-center">
            {storeName}
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

          {/* Dynamic Button Styling */}
          <button 
            type="submit" 
            disabled={!termsAccepted || isSubmitting}
            className={`w-full ${activeTheme.bg} ${activeTheme.hoverBg} ${activeTheme.text} font-bold py-4 rounded-xl text-base transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Processing...' : 'Join Program'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}