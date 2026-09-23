// app/dashboard/customization/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Star, Coffee, Scissors, Pizza, ShoppingBag, Award, Heart, Layout, Wallet, Smartphone } from 'lucide-react'

// Map string names to actual Lucide React components for the preview
const StampIconMap: Record<string, any> = {
  star: Star,
  coffee: Coffee,
  scissors: Scissors,
  pizza: Pizza,
  bag: ShoppingBag,
  award: Award,
  heart: Heart,
}

// Expanded Theme Dictionary mapped to Tailwind classes for the preview
const ThemeStyles: Record<string, { bg: string; hoverBg: string; text: string; lightBg: string; border: string; shadow: string; iconBg: string; iconText: string }> = {
  blue: { bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-500', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-100', shadow: 'shadow-blue-200', iconBg: 'bg-blue-500/10', iconText: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-600', hoverBg: 'hover:bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-200', iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-600' },
  rose: { bg: 'bg-rose-600', hoverBg: 'hover:bg-rose-500', text: 'text-rose-600', lightBg: 'bg-rose-50', border: 'border-rose-100', shadow: 'shadow-rose-200', iconBg: 'bg-rose-500/10', iconText: 'text-rose-600' },
  amber: { bg: 'bg-amber-600', hoverBg: 'hover:bg-amber-500', text: 'text-amber-600', lightBg: 'bg-amber-50', border: 'border-amber-100', shadow: 'shadow-amber-200', iconBg: 'bg-amber-500/10', iconText: 'text-amber-600' },
  dark: { bg: 'bg-gray-900', hoverBg: 'hover:bg-gray-800', text: 'text-gray-900', lightBg: 'bg-gray-100', border: 'border-gray-200', shadow: 'shadow-gray-200', iconBg: 'bg-gray-200', iconText: 'text-gray-900' },
  violet: { bg: 'bg-violet-600', hoverBg: 'hover:bg-violet-500', text: 'text-violet-600', lightBg: 'bg-violet-50', border: 'border-violet-100', shadow: 'shadow-violet-200', iconBg: 'bg-violet-500/10', iconText: 'text-violet-600' },
  cyan: { bg: 'bg-cyan-600', hoverBg: 'hover:bg-cyan-500', text: 'text-cyan-600', lightBg: 'bg-cyan-50', border: 'border-cyan-100', shadow: 'shadow-cyan-200', iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-600' },
  orange: { bg: 'bg-orange-600', hoverBg: 'hover:bg-orange-500', text: 'text-orange-600', lightBg: 'bg-orange-50', border: 'border-orange-100', shadow: 'shadow-orange-200', iconBg: 'bg-orange-500/10', iconText: 'text-orange-600' },
}

export default function CustomizationPage() {
  const [activeTab, setActiveTab] = useState<'portal' | 'wallet'>('portal')

  // Portal Customization State
  const [storeName, setStoreName] = useState('My Store')
  const [themeColor, setThemeColor] = useState('blue')
  const [stampIcon, setStampIcon] = useState('star')
  const [bgPattern, setBgPattern] = useState('clean')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  
  // Wallet Pass Customization State
  const [passBackgroundColor, setPassBackgroundColor] = useState('#1e293b')
  const [passHeaderColor, setPassHeaderColor] = useState('#ffffff')

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function fetchCustomizations() {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data: businessData } = await supabase
          .from('businesses')
          .select('id, store_name, theme_color, stamp_icon, bg_pattern, logo_url')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (businessData) {
          if (businessData.store_name) setStoreName(businessData.store_name)
          if (businessData.theme_color) setThemeColor(businessData.theme_color)
          if (businessData.stamp_icon) setStampIcon(businessData.stamp_icon)
          if (businessData.bg_pattern) setBgPattern(businessData.bg_pattern)
          if (businessData.logo_url) setLogoUrl(businessData.logo_url)
        }
      } catch (err) {
        console.error('Failed to load customizations', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomizations()
  }, [supabase])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    setErrorMsg('')

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('store-logos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('store-logos')
        .getPublicUrl(fileName)

      setLogoUrl(publicUrl)
    } catch (error: any) {
      console.error('Logo upload error:', error)
      setErrorMsg('Failed to upload logo. Ensure your file is under 2MB and public bucket access is configured.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id)
        .single()

      if (!businessData) throw new Error('Business not found')

      const { error: businessUpdateError } = await supabase
        .from('businesses')
        .update({ 
          theme_color: themeColor,
          stamp_icon: stampIcon,
          bg_pattern: bgPattern,
          logo_url: logoUrl
        })
        .eq('id', businessData.id)

      if (businessUpdateError) throw new Error('Failed to save customization settings.')

      setToastMessage('Store Branding Saved Successfully!')
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // --- PREVIEW LOGIC ---
  const activeTheme = ThemeStyles[themeColor] || ThemeStyles.blue
  const SelectedStampIcon = StampIconMap[stampIcon] || Star

  const getBackgroundClass = () => {
    if (bgPattern === 'dots') return 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-gray-50'
    if (bgPattern === 'grid') return 'bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] bg-gray-50'
    if (bgPattern === 'diagonal-stripes') return 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f9fafb_10px,#f9fafb_20px)] bg-gray-50'
    if (bgPattern === 'waves') return 'bg-[radial-gradient(circle_at_100%_50%,transparent_20%,#f3f4f6_21%,#f3f4f6_34%,transparent_35%,transparent),radial-gradient(circle_at_0%_50%,transparent_20%,#f3f4f6_21%,#f3f4f6_34%,transparent_35%,transparent)] bg-[size:60px_60px] bg-gray-50'
    return 'bg-gray-50'
  }

  return (
    <>
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Increased max-width to allow for a side-by-side preview on large screens */}
      <div className="max-w-7xl mx-auto pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Portal Customization</h2>
          <p className="text-gray-500 mt-2">Design both your web-based check-in portal and mobile wallet passes.</p>
        </div>

        {/* --- TABS NAVIGATION --- */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-2 pb-4 px-6 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'portal'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layout className="w-4 h-4" />
            Customer Web Portal & Registration
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 pb-4 px-6 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Apple & Google Wallet Passes
          </button>
        </div>
        
        {errorMsg && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-500 animate-pulse font-medium">Loading customization settings...</div>
        ) : (
          <form onSubmit={handleSaveCustomization}>
            
            {/* --- TAB 1: WEB PORTAL & REGISTRATION --- */}
            {activeTab === 'portal' && (
              <div className="grid lg:grid-cols-12 gap-10 animate-in fade-in duration-300">
                
                {/* LEFT COLUMN: SETTINGS */}
                <div className="lg:col-span-7 space-y-8">
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-10">
                    
                    {/* Logo Upload Section */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Brand Identity</h3>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">Store Logo</label>
                      <div className="flex items-center gap-6">
                        {logoUrl ? (
                          <div className="relative">
                            <img src={logoUrl} alt="Store Logo" className="w-24 h-24 object-contain rounded-xl border border-gray-200 shadow-sm bg-gray-50 p-2" />
                            <button 
                              type="button" 
                              onClick={() => setLogoUrl(null)} 
                              className="absolute -top-3 -right-3 bg-red-100 text-red-600 rounded-full p-1.5 hover:bg-red-200 transition-colors shadow-sm"
                              title="Remove Logo"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                        
                        <div>
                          <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors inline-block ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploadingLogo ? 'Uploading...' : 'Upload Image'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleLogoUpload}
                              disabled={isUploadingLogo}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-2">Recommended: Transparent PNG (Max 2MB).</p>
                        </div>
                      </div>
                    </div>

                    {/* Theme Color Selection */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Primary Color</h3>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { id: 'blue', class: 'bg-blue-600' },
                          { id: 'emerald', class: 'bg-emerald-600' },
                          { id: 'rose', class: 'bg-rose-600' },
                          { id: 'amber', class: 'bg-amber-600' },
                          { id: 'violet', class: 'bg-violet-600' },
                          { id: 'cyan', class: 'bg-cyan-500' },
                          { id: 'orange', class: 'bg-orange-500' },
                          { id: 'dark', class: 'bg-gray-900' },
                        ].map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => setThemeColor(color.id)}
                            className={`w-14 h-14 rounded-full ${color.class} flex items-center justify-center transition-all ${
                              themeColor === color.id 
                                ? 'ring-4 ring-offset-4 ring-blue-500 scale-110 shadow-lg' 
                                : 'ring-1 ring-gray-200 hover:scale-105'
                            }`}
                          >
                            {themeColor === color.id && (
                              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-3">Determines the accent color for buttons and highlights across your customer web portal.</p>
                    </div>

                    {/* Stamp Icon Selection */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Reward Stamp Shape</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
                        {[
                          { id: 'star', Icon: Star },
                          { id: 'coffee', Icon: Coffee },
                          { id: 'scissors', Icon: Scissors },
                          { id: 'pizza', Icon: Pizza },
                          { id: 'bag', Icon: ShoppingBag },
                          { id: 'award', Icon: Award },
                          { id: 'heart', Icon: Heart },
                        ].map((stamp) => {
                          const Icon = stamp.Icon
                          return (
                            <button
                              key={stamp.id}
                              type="button"
                              onClick={() => setStampIcon(stamp.id)}
                              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                stampIcon === stamp.id 
                                  ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
                                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-8 h-8" />
                              <span className="text-[11px] font-bold capitalize">{stamp.id}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Background Pattern Selection */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Portal Background Texture</h3>
                      <select
                        value={bgPattern}
                        onChange={(e) => setBgPattern(e.target.value)}
                        className="w-full md:w-1/2 rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors bg-white font-medium"
                      >
                        <option value="clean">Clean (Solid Light Gray)</option>
                        <option value="dots">Modern Dots</option>
                        <option value="grid">Subtle Grid</option>
                      </select>
                    </div>

                  </section>
                  
                  <div className="flex justify-end pb-8">
                    <button
                      type="submit"
                      disabled={isSaving || isUploadingLogo}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 active:scale-95 shadow-md w-full lg:w-auto"
                    >
                      {isSaving ? 'Saving...' : 'Save Appearance'}
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: LIVE PREVIEW MOCKUP */}
                <div className="lg:col-span-5 relative">
                  <div className="sticky top-8 flex justify-center">
                    
                    {/* Phone Frame */}
                    <div className="w-[340px] h-[720px] bg-white border-[12px] border-gray-900 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center">
                      
                      {/* Notch */}
                      <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto z-20"></div>

                      {/* Mockup Screen Content */}
                      <div className={`w-full h-full pt-12 px-4 pb-6 overflow-y-auto transition-colors duration-300 ${getBackgroundClass()}`}>
                        
                        {/* Header Mockup */}
                        <div className="text-center flex flex-col items-center mb-6">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Store Logo" className="w-16 h-16 object-contain rounded-xl mb-3 shadow-sm bg-white p-1.5" />
                          ) : (
                            <div className={`w-14 h-14 ${activeTheme.iconBg} ${activeTheme.iconText} rounded-2xl flex items-center justify-center mb-3 shadow-sm`}>
                              <span className="font-black text-2xl">{(storeName || 'K').charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{storeName}</h1>
                          <p className="text-gray-500 text-xs mt-1 font-medium">Customer Loyalty Portal</p>
                        </div>

                        {/* Card Mockup 1: Balance Check */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                          <h2 className="text-base font-bold text-gray-800 text-center mb-4">Check Your Stamps</h2>
                          <div className="w-full text-center text-sm rounded-xl border border-gray-200 px-3 py-3 text-gray-400 mb-4 bg-gray-50">
                            Phone Number
                          </div>
                          <div className={`w-full ${activeTheme.bg} text-white px-4 py-3 rounded-xl font-bold text-sm text-center shadow-md ${activeTheme.shadow}`}>
                            Check Balance
                          </div>
                        </div>

                        {/* Card Mockup 2: Loyalty Grid */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                          <h2 className="text-lg font-bold text-gray-900">Welcome back, Sarah!</h2>
                          <p className="text-gray-500 text-xs mt-1 font-medium">3 / 10 Stamps Collected</p>
                          
                          <div className="flex flex-wrap justify-center gap-2 mt-5 mb-5">
                            {Array.from({ length: 10 }).map((_, index) => {
                              const isStamped = index < 3;
                              return (
                                <div 
                                  key={index} 
                                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                                    isStamped 
                                      ? `${activeTheme.bg} text-white${activeTheme.shadow}` 
                                      : 'bg-gray-100 text-gray-300 border-2 border-dashed border-gray-200'
                                  }`}
                                >
                                  {isStamped ? <SelectedStampIcon className="w-4 h-4" /> : ''}
                                </div>
                              )
                            })}
                          </div>
                          
                          <div className={`${activeTheme.lightBg} ${activeTheme.text} py-2.5 px-3 rounded-xl font-medium text-xs`}>
                            7 more stamps to unlock a reward!
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* --- TAB 2: WALLET PASSES --- */}
            {activeTab === 'wallet' && (
              <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Wallet Passes (Apple & Google Wallet)</h3>
                    <p className="text-sm text-gray-500">Configure how your digital loyalty card appears when saved directly to a customer's phone wallet app.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 pt-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Pass Background Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={passBackgroundColor}
                          onChange={(e) => setPassBackgroundColor(e.target.value)}
                          className="w-12 h-12 rounded-xl border border-gray-300 cursor-pointer p-1 bg-white"
                        />
                        <span className="text-sm font-mono text-gray-600">{passBackgroundColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Pass Text / Header Color</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={passHeaderColor}
                          onChange={(e) => setPassHeaderColor(e.target.value)}
                          className="w-12 h-12 rounded-xl border border-gray-300 cursor-pointer p-1 bg-white"
                        />
                        <span className="text-sm font-mono text-gray-600">{passHeaderColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-blue-900 flex items-start gap-4">
                    <Wallet className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm mb-1">Wallet Pass Integration Ready</h4>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        These settings are primed for your future pass distribution workflow. When users add their loyalty card to Apple Wallet or Google Wallet, these color configurations and your uploaded store logo will automatically render on the digital pass wrapper.
                      </p>
                    </div>
                  </div>
                </section>
                
                <div className="flex justify-end pb-8">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 active:scale-95 shadow-md"
                  >
                    {isSaving ? 'Saving...' : 'Save Appearance'}
                  </button>
                </div>
              </div>
            )}

          </form>
        )}
      </div>
    </>
  )
}