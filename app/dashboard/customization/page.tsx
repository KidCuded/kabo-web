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
  const [portalBgType, setPortalBgType] = useState<'color' | 'pattern' | 'image'>('color')
  const [portalBgValue, setPortalBgValue] = useState('#f9fafb')
  const [stampIconUrl, setStampIconUrl] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingStamp, setIsUploadingStamp] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)
  
  // Wallet Pass Customization State
  const [passBackgroundColor, setPassBackgroundColor] = useState('#1e293b')
  const [passHeaderColor, setPassHeaderColor] = useState('#ffffff')
  const [walletHeroUrl, setWalletHeroUrl] = useState<string | null>(null)
  const [isUploadingHero, setIsUploadingHero] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
          .select('id, store_name, theme_color, stamp_icon, bg_pattern, logo_url, portal_bg_type, portal_bg_value, stamp_icon_url, wallet_hero_url, pass_bg_color, pass_text_color')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (businessData) {
          if (businessData.store_name) setStoreName(businessData.store_name)
          if (businessData.theme_color) setThemeColor(businessData.theme_color)
          if (businessData.stamp_icon) setStampIcon(businessData.stamp_icon)
          if (businessData.bg_pattern) setBgPattern(businessData.bg_pattern)
          if (businessData.logo_url) setLogoUrl(businessData.logo_url)
          if (businessData.portal_bg_type) {
            setPortalBgType(businessData.portal_bg_type as 'color' | 'pattern' | 'image')
          }
          if (businessData.portal_bg_value) setPortalBgValue(businessData.portal_bg_value)
          if (businessData.stamp_icon_url) setStampIconUrl(businessData.stamp_icon_url)
          if (businessData.wallet_hero_url) setWalletHeroUrl(businessData.wallet_hero_url)
          if (businessData.pass_bg_color) setPassBackgroundColor(businessData.pass_bg_color)
          if (businessData.pass_text_color) setPassHeaderColor(businessData.pass_text_color)
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

      // Retrieve the public URL
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'stamp' | 'background' | 'hero') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'stamp') setIsUploadingStamp(true)
    if (type === 'background') setIsUploadingBg(true)
    if (type === 'hero') setIsUploadingHero(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      // 1. Clean up the old image first!
      let oldUrl = null
      if (type === 'stamp') oldUrl = stampIconUrl
      if (type === 'background' && portalBgType === 'image') oldUrl = portalBgValue
      if (type === 'hero') oldUrl = walletHeroUrl
      
      await deleteImageFromBucket(oldUrl)

      // 2. Upload the new image
      const fileExt = file.name.split('.').pop()
      const fileName = `${userData.user.id}-${type}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('store-logos')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('store-logos')
        .getPublicUrl(fileName)

      const publicUrl = publicUrlData.publicUrl

      // 3. Update the correct state
      if (type === 'stamp') setStampIconUrl(publicUrl)
      else if (type === 'background') setPortalBgValue(publicUrl)
      else if (type === 'hero') setWalletHeroUrl(publicUrl)

    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error)
      alert(`Failed to upload ${type}. Please check your connection.`)
    } finally {
      if (type === 'stamp') setIsUploadingStamp(false)
      if (type === 'background') setIsUploadingBg(false)
      if (type === 'hero') setIsUploadingHero(false)
      e.target.value = ''
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
          logo_url: logoUrl,
          portal_bg_type: portalBgType,
          portal_bg_value: portalBgValue,
          stamp_icon_url: stampIconUrl,
          wallet_hero_url: walletHeroUrl,
          pass_bg_color: passBackgroundColor,   
          pass_text_color: passHeaderColor
        })
        .eq('id', businessData.id)
        
      await fetch('/api/wallet/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: businessData.id,
          storeName: storeName, // Ensure storeName is in your state variables
          logoUrl: logoUrl,
          passBackgroundColor: passBackgroundColor,
          heroImageUrl: walletHeroUrl
        })
      })

      if (businessUpdateError) throw new Error('Failed to save customization settings.')

      setToastMessage('Store Branding Saved Successfully!')
      setTimeout(() => setToastMessage(''), 3000)

    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // PREVIEW LOGIC
  // Helper for dynamic preview background styles                       
  const getPortalBackgroundStyle = () => {
    if (portalBgType === 'image' && portalBgValue) {
      return {
        backgroundImage: `url('${portalBgValue}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    if (portalBgType === 'color') return { backgroundColor: portalBgValue }
    return {} 
  }

  // Helper for dynamic preview patterns
  const getPortalPatternClass = () => {
    if (portalBgType === 'pattern') {
      if (portalBgValue === 'dots') return 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] bg-gray-50'
      if (portalBgValue === 'grid') return 'bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] bg-gray-50'
    }
    return 'bg-gray-50'
  }

  // Dynamic icon resolver for preview
  const PreviewStampIcon = {
    star: Star, coffee: Coffee, scissors: Scissors, pizza: Pizza, bag: ShoppingBag, award: Award, heart: Heart
  }[stampIcon] || Star

  // Helper to delete orphaned images and prevent bucket bloat
  const deleteImageFromBucket = async (url: string | null) => {
    if (!url || !url.includes('store-logos/')) return 
    try {
      const fileName = url.split('store-logos/')[1]
      if (fileName) {
        await supabase.storage.from('store-logos').remove([fileName])
      }
    } catch (err) {
      console.error("Failed to delete image from bucket:", err)
    }
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
                            onClick={() => {
                              deleteImageFromBucket(logoUrl)
                              setLogoUrl(null)
                            }} 
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
                  </div>

                  {/* Stamp Icon Selection & Custom Upload */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Reward Stamp Graphic</h3>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-6">
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
                            onClick={() => {
                              setStampIcon(stamp.id)
                              // If they had a custom stamp and clicked a preset, delete the custom stamp
                              if (stampIconUrl) {
                                deleteImageFromBucket(stampIconUrl)
                                setStampIconUrl(null)
                              }
                            }}
                            className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                              stampIcon === stamp.id && !stampIconUrl
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

                    <div className={`flex items-center gap-6 p-5 rounded-xl border transition-all ${stampIconUrl ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="w-16 h-16 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                        {stampIconUrl ? (
                          <img src={stampIconUrl} alt="Custom Stamp" className="w-10 h-10 object-contain" />
                        ) : (
                          <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        )}
                      </div>
                      <div>
                        <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors inline-block ${isUploadingStamp ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isUploadingStamp ? 'Uploading...' : 'Upload Custom Stamp'}
                          <input 
                            type="file" 
                            accept="image/png, image/svg+xml" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, 'stamp')} 
                            disabled={isUploadingStamp}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">100x100px PNG/SVG.</p>
                      </div>
                    </div>
                  </div>

                  {/* Portal Background Customization */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Portal Background</h3>
                    
                    <div className="flex gap-3 sm:gap-4 mb-5">
                      {['color', 'pattern', 'image'].map((type) => (
                        <label key={type} className={`flex-1 cursor-pointer rounded-xl border p-3 text-center transition-all ${portalBgType === type ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'}`}>
                          <input 
                            type="radio" 
                            name="bgType" 
                            value={type} 
                            checked={portalBgType === type} 
                            onChange={(e) => {
                              const newType = e.target.value as 'color' | 'pattern' | 'image'
                              
                              // If they switch away from 'image', delete the orphaned background image
                              if (portalBgType === 'image' && newType !== 'image') {
                                deleteImageFromBucket(portalBgValue)
                              }

                              setPortalBgType(newType)
                              if (newType === 'color') setPortalBgValue('#f9fafb')
                              if (newType === 'pattern') setPortalBgValue('dots')
                              if (newType === 'image') setPortalBgValue('')
                            }}
                            className="sr-only" 
                          />
                          <span className="font-semibold capitalize text-sm">{type}</span>
                        </label>
                      ))}
                    </div>

                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                      {portalBgType === 'color' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">Select Solid Color</label>
                          <div className="flex items-center gap-4">
                            <input 
                              type="color" 
                              value={portalBgValue.startsWith('#') ? portalBgValue : '#f9fafb'}
                              onChange={(e) => setPortalBgValue(e.target.value)}
                              className="w-14 h-14 rounded-xl border border-gray-300 cursor-pointer p-1 bg-white"
                            />
                            <span className="text-sm font-mono text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">{portalBgValue}</span>
                          </div>
                        </div>
                      )}

                      {portalBgType === 'pattern' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">Select Pattern Texture</label>
                          <select 
                            value={portalBgValue} 
                            onChange={(e) => setPortalBgValue(e.target.value)}
                            className="w-full sm:w-1/2 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors bg-white font-medium"
                          >
                            <option value="clean">Clean (Solid Light Gray)</option>
                            <option value="dots">Modern Dots</option>
                            <option value="grid">Subtle Grid</option>
                          </select>
                        </div>
                      )}

                      {portalBgType === 'image' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">Upload Background Image</label>
                          <div className="flex items-center gap-6">
                            {portalBgValue && portalBgValue.startsWith('http') ? (
                              <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <img src={portalBgValue} alt="Background Preview" className="w-full h-full object-cover" />
                                <button onClick={() => setPortalBgValue('')} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-md hover:bg-black transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ) : (
                              <div>
                                <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors inline-block ${isUploadingBg ? 'opacity-50 pointer-events-none' : ''}`}>
                                  {isUploadingBg ? 'Uploading...' : 'Choose Image'}
                                  <input 
                                    type="file" 
                                    accept="image/jpeg, image/png, image/webp"
                                    onChange={(e) => handleImageUpload(e, 'background')} 
                                    className="hidden"
                                    disabled={isUploadingBg}
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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

              {/* RIGHT COLUMN: LIVE PREVIEW */}
              <div className="lg:col-span-5 hidden lg:block">
                <div className="sticky top-8 space-y-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 text-center">Web Portal Preview</h3>
                  
                  {/* Phone Mockup Wrapper */}
                  <div className="mx-auto w-[340px] h-[670px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl relative border-4 border-gray-800">
                    
                    {/* Mockup Screen Content */}
                    <div 
                      className={`w-full h-full rounded-[2.5rem] overflow-hidden relative flex flex-col items-center p-5 overflow-y-auto ${getPortalPatternClass()}`}
                      style={getPortalBackgroundStyle()}
                    >
                      {/* Store Logo Header */}
                      <div className="mt-6 mb-2 flex flex-col items-center">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-2xl mb-3 shadow-sm bg-white p-2 border border-gray-100" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-white border border-gray-200 shadow-sm">
                            <span className="font-black text-2xl text-gray-400">{(storeName || 'K').charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{storeName || 'Store Name'}</h1>
                        <p className="text-xs text-gray-500 font-medium">Customer Loyalty Portal</p>
                      </div>

                      {/* Loyalty Status Card */}
                      <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl p-6 w-full shadow-xl my-auto text-center">
                        
                        <h2 className="text-lg font-bold text-gray-900 mb-0.5">Welcome back, Sarah!</h2>
                        <p className="text-xs text-gray-500 mb-6 font-medium">3 / 10 Stamps Collected</p>
                        
                        {/* 10-Stamp Grid (3 Active / 7 Inactive) */}
                        <div className="grid grid-cols-5 gap-3 mb-6 max-w-[240px] mx-auto">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                            const isEarned = idx <= 3
                            
                            // Primary theme color mapped for active stamps
                            const themeBgClasses: Record<string, string> = {
                              blue: 'bg-blue-600 text-white',
                              emerald: 'bg-emerald-600 text-white',
                              rose: 'bg-rose-600 text-white',
                              amber: 'bg-amber-600 text-white',
                              violet: 'bg-violet-600 text-white',
                              cyan: 'bg-cyan-500 text-white',
                              orange: 'bg-orange-500 text-white',
                              dark: 'bg-gray-900 text-white',
                            }
                            
                            const activeBg = themeBgClasses[themeColor] || 'bg-blue-600 text-white'

                            return (
                              <div 
                                key={idx} 
                                className={`w-10 h-10 rounded-full flex items-center justify-center p-2.5 transition-all shadow-xs ${
                                  isEarned 
                                    ? activeBg 
                                    : 'bg-gray-100/80 border-2 border-dashed border-gray-200 text-gray-300'
                                }`}
                              >
                                {stampIconUrl ? (
                                  <img 
                                    src={stampIconUrl} 
                                    alt="stamp" 
                                    className={`w-full h-full object-contain ${!isEarned ? 'opacity-20 grayscale' : ''}`} 
                                  />
                                ) : (
                                  <PreviewStampIcon className="w-full h-full stroke-[2.5]" />
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Reward Progress Banner */}
                        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl py-3 px-4 mb-4">
                          <p className="text-xs font-semibold text-amber-800">
                            Only 7 more stamps to unlock: <span className="font-bold">Free Coffee</span>
                          </p>
                        </div>

                        {/* Secondary Link */}
                        <p className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
                          Check a different number
                        </p>

                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* --- TAB 2: WALLET PASSES --- */}
            {activeTab === 'wallet' && (
              <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl">
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10">
                  
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Controls */}
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Wallet Passes</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">Configure how your digital loyalty card appears when saved directly to a customer's Apple Wallet or Google Wallet app.</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Pass Background Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={passBackgroundColor}
                              onChange={(e) => setPassBackgroundColor(e.target.value)}
                              className="w-12 h-12 rounded-xl border border-gray-300 cursor-pointer p-1 bg-white shrink-0"
                            />
                            <span className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">{passBackgroundColor}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Pass Text / Header Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={passHeaderColor}
                              onChange={(e) => setPassHeaderColor(e.target.value)}
                              className="w-12 h-12 rounded-xl border border-gray-300 cursor-pointer p-1 bg-white shrink-0"
                            />
                            <span className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">{passHeaderColor}</span>
                          </div>
                        </div>
                      </div>

                      {/* NEW: Hero Banner Uploader */}
                      <div className="border-t border-gray-100 pt-8">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Hero Banner Image (Strip)</h3>
                        <p className="text-xs text-gray-500 mb-4">A rich edge-to-edge graphic that appears directly beneath the header on the digital card.</p>
                        
                        <div className="flex flex-col gap-4">
                          {walletHeroUrl ? (
                            <div className="relative w-full aspect-[3/1] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                              <img src={walletHeroUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => {
                                  // Trigger your bucket deletion helper
                                  deleteImageFromBucket(walletHeroUrl)
                                  setWalletHeroUrl(null)
                                }} 
                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-md hover:bg-black transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ) : (
                            <div className="w-full aspect-[3/1] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 p-4">
                              <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              <span className="text-xs font-semibold">1036 x 336px</span>
                            </div>
                          )}
                          
                          <div>
                            <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-colors inline-block ${isUploadingHero ? 'opacity-50 pointer-events-none' : ''}`}>
                              {isUploadingHero ? 'Uploading...' : 'Upload Banner'}
                              <input 
                                type="file" 
                                accept="image/jpeg, image/png, image/webp" 
                                className="hidden" 
                                onChange={(e) => {
                                  // Trigger your upload handler
                                  handleImageUpload(e, 'hero')
                                }}
                                disabled={isUploadingHero}
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Recommended: JPEG/PNG. Must not exceed 2MB.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        <div>
                          <h4 className="font-bold text-sm text-blue-900 mb-1">Cross-Platform Ready</h4>
                          <p className="text-xs text-blue-700 leading-relaxed">
                            The layout above will automatically map to a <strong>Google Wallet Hero Image</strong> and an <strong>Apple Wallet Strip Image</strong> when users download their cards.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Live Wallet Preview */}
                    <div className="flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 p-8 sm:p-12 relative overflow-hidden">
                      {/* Subtle background decoration */}
                      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                      
                      <div 
                        className="relative w-full max-w-[280px] aspect-[1/1.7] rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 ring-1 ring-black/5" 
                        style={{ backgroundColor: passBackgroundColor }}
                      >
                        {/* Simulated Wallet App Header */}
                        <div className="absolute top-0 w-full p-6 flex justify-between items-start z-10" style={{ color: passHeaderColor }}>
                          <div className="flex items-center gap-3">
                            {logoUrl ? (
                              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-sm overflow-hidden shrink-0">
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
                                <span className="font-bold text-lg leading-none">{(storeName || 'K').charAt(0)}</span>
                              </div>
                            )}
                            <span className="font-bold text-lg truncate opacity-90">{storeName || 'Your Store'}</span>
                          </div>
                        </div>

                        {/* Simulated Pass Content */}
                        <div className="absolute inset-0 pt-20 px-5 pb-5 flex flex-col">
                          
                          {/* Conditional Hero Banner */}
                          {walletHeroUrl ? (
                            <div className="w-full h-20 rounded-xl overflow-hidden shadow-md border border-black/5 mb-4 shrink-0">
                              <img src={walletHeroUrl} alt="Hero" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-6"></div> /* Spacing if no banner */
                          )}

                          <div className="flex-1">
                            {/* Dummy Stamps/Points Module */}
                            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/10 shadow-inner">
                              <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1" style={{ color: passHeaderColor }}>Current Stamps</p>
                              <p className="text-5xl font-black tracking-tight" style={{ color: passHeaderColor }}>0</p>
                            </div>
                          </div>

                          {/* Simulated QR Code Area */}
                          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg mt-auto">
                            <svg className="w-28 h-28 text-gray-900 mb-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zM15 5v4h4V5zM3 13h8v8H3zM5 15v4h4v-4zM18 13h3v3h-3zM13 13h3v3h-3zM15 18h3v3h-3zM18 16h3v3h-3zM13 18h2v3h-2z" />
                            </svg>
                            <p className="text-[10px] text-gray-500 font-mono font-medium tracking-widest">012-345-6789</p>
                          </div>
                          
                        </div>
                      </div>
                    </div>

                  </div>
                </section>
                
                <div className="flex justify-end pb-8">
                  <button
                    type="button"
                    onClick={handleSaveCustomization}
                    disabled={isSaving || isUploadingHero}
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