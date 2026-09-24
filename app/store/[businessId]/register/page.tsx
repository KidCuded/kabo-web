// app/store/[businessId]/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { registerCustomer } from '@/app/actions/registerCustomer'

// Expanded Theme Dictionary mapped to Tailwind classes
const ThemeStyles: Record<string, { bg: string; hoverBg: string; text: string; iconBg: string; iconText: string }> = {
  blue: { bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-500', text: 'text-white', iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-500', text: 'text-white', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
  rose: { bg: 'bg-rose-600', hoverBg: 'hover:bg-rose-500', text: 'text-white', iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
  amber: { bg: 'bg-amber-600', hoverBg: 'hover:bg-amber-500', text: 'text-white', iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
  dark: { bg: 'bg-gray-900', hoverBg: 'hover:bg-gray-800', text: 'text-white', iconBg: 'bg-gray-100', iconText: 'text-gray-900' },
  violet: { bg: 'bg-violet-600', hoverBg: 'hover:bg-violet-500', text: 'text-white', iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
  cyan: { bg: 'bg-cyan-600', hoverBg: 'hover:bg-cyan-500', text: 'text-white', iconBg: 'bg-cyan-50', iconText: 'text-cyan-600' },
  orange: { bg: 'bg-orange-600', hoverBg: 'hover:bg-orange-500', text: 'text-white', iconBg: 'bg-orange-50', iconText: 'text-orange-600' },
}

export default function CustomerRegistration() {
  const params = useParams()
  const businessId = params.businessId as string
  const supabase = createClient()

  // Form & Customer State
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<{ name: string; phone: string } | null>(null)

  // Wallet State
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android' | 'other'>('other')
  const [googleWalletUrl, setGoogleWalletUrl] = useState<string | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)

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

    // OS Detection for Wallet Buttons
    const userAgent = window.navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceOS('ios')
    } else if (/android/.test(userAgent)) {
      setDeviceOS('android')
    }
  }, [businessId, supabase])

  // Fetch Google Wallet Link when registration succeeds
  useEffect(() => {
    async function generatePass() {
      if (status?.success && customerInfo && (deviceOS === 'android' || deviceOS === 'other')) {
        setIsLoadingWallet(true)
        try {
          const res = await fetch('/api/wallet/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId,
              customerName: customerInfo.name,
              phoneNumber: customerInfo.phone
            })
          })
          const data = await res.json()
          if (data.saveUrl) setGoogleWalletUrl(data.saveUrl)
        } catch (err) {
          console.error('Failed to fetch wallet pass', err)
        } finally {
          setIsLoadingWallet(false)
        }
      }
    }
    generatePass()
  }, [status?.success, customerInfo, businessId, deviceOS])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!termsAccepted) return

    setIsSubmitting(true)
    setStatus(null)

    const formData = new FormData(event.currentTarget)
    formData.append('business_id', businessId)

    // Save info for wallet pass generation before submitting
    const name = formData.get('name') as string
    const phone = formData.get('phone_number') as string

    const result = await registerCustomer(formData)
    
    if (result.error) {
      setStatus({ error: result.error })
    } else {
      setCustomerInfo({ name, phone })
      setStatus({ success: true })
    }
    setIsSubmitting(false)
  }

  // Resolve dynamic branding styles
  const activeTheme = ThemeStyles[themeColor] || ThemeStyles.blue
  
  // Patterns (Light Mode)
  const getBackgroundClass = () => {
    if (bgPattern === 'dots') return 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-gray-50'
    if (bgPattern === 'grid') return 'bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] bg-gray-50'
    return 'bg-gray-50' // 'clean' default
  }

  if (status?.success) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center p-4 font-sans transition-colors duration-300`}>
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center max-w-md w-full shadow-xl">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Complete!</h2>
          <p className="text-base text-gray-500 mb-8">Save your loyalty card to your phone for quick access.</p>
          
          <div className="space-y-4 mb-8">
            {(deviceOS === 'ios' || deviceOS === 'other') && (
              <button 
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                onClick={() => alert("Apple Wallet support requires a .pkpass generator. We will build this backend logic next!")}
              >
                <svg className="w-6 h-6" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                Add to Apple Wallet
              </button>
            )}

            {(deviceOS === 'android' || deviceOS === 'other') && (
              googleWalletUrl ? (
                <a 
                  href={googleWalletUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#1a1c23] hover:bg-[#2c2f38] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.1 12.4c0-.8-.1-1.5-.2-2.3H12v4.5h5.3c-.2 1.5-.9 2.7-2.1 3.5v2.8h3.3c2-1.8 3.1-4.5 3.1-7.8l.1-.7z"/><path d="M12 21.6c2.6 0 4.7-.8 6.3-2.3l-3.3-2.8c-.9.6-2 .9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H3.3v2.9c1.6 3.1 4.7 5.1 8.7 5.1z" fill="#34A853"/><path d="M6.9 13.6c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.1H3.3C2.6 8.5 2.2 10.2 2.2 12s.4 3.5 1.1 4.9l3.6-3.3z" fill="#FBBC05"/><path d="M12 5.8c1.4 0 2.6.5 3.6 1.4l2.7-2.7C16.6 2.9 14.5 2 12 2 8 2 4.9 4.1 3.3 7.1l3.6 2.9c.7-2.2 2.7-4.2 5.1-4.2z" fill="#EA4335"/></svg>
                  Add to Google Wallet
                </a>
              ) : (
                <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold py-4 rounded-xl flex items-center justify-center gap-3">
                  {isLoadingWallet ? 'Generating Pass...' : 'Google Wallet Unavailable'}
                </button>
              )
            )}
          </div>

          <Link 
            href={`/store/${businessId}`} 
            className="block w-full text-gray-500 hover:text-gray-900 font-medium py-2 text-sm transition-colors"
          >
            Skip for now, return to store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300`}>
      
      <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-xl relative">
        
        {/* Dynamic Header & Logo */}
        <div className="flex flex-col items-center mb-8">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={storeName} 
              className="w-16 h-16 object-contain rounded-xl mb-5 shadow-sm border border-gray-100" 
            />
          ) : (
            <div className={`w-14 h-14 ${activeTheme.iconBg} ${activeTheme.iconText} rounded-2xl flex items-center justify-center mb-5`}>
              <span className="font-black text-3xl">{(storeName || 'K').charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h1 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2 text-center">
            {storeName}
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Sign up to join this business's loyalty program
          </p>
        </div>

        {status?.error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl mb-8 text-center font-medium">
            {status.error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full name <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="text" 
              name="name" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="email" 
              name="email" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth (Optional)
            </label>
            <input 
              type="date" 
              name="date_of_birth" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input 
              required 
              type="tel" 
              name="phone_number"
              placeholder="0123456789"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-gray-400" 
            />
          </div>

          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="terms"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed cursor-pointer select-none">
              By signing up, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </label>
          </div>

          {/* Dynamic Button Styling */}
          <button 
            type="submit" 
            disabled={!termsAccepted || isSubmitting}
            className={`w-full ${activeTheme.bg} ${activeTheme.hoverBg} ${activeTheme.text} font-bold py-4 rounded-xl text-base transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Processing...' : 'Join Program'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}