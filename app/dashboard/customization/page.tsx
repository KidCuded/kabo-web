// app/dashboard/customization/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '@/utils/cropImage'
import { Star, Coffee, Scissors, Pizza, ShoppingBag, Award, Heart, Layout, Wallet } from 'lucide-react'

const StampIconMap: Record<string, any> = {
  star: Star, coffee: Coffee, scissors: Scissors, pizza: Pizza, bag: ShoppingBag, award: Award, heart: Heart
}

// Common hex presets for quick selection
const COLOR_PRESETS = ['#2563EB', '#059669', '#E11D48', '#D97706', '#4F46E5', '#0891B2', '#EA580C', '#111827']

export default function CustomizationPage() {
  // Preview Toggle State
  const [previewMode, setPreviewMode] = useState<'portal' | 'wallet'>('portal')
  const [storeName, setStoreName] = useState('My Store')

  // --- UNIFIED BRAND KIT STATE ---
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#2563EB')
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF')

  // Background State
  const [bgType, setBgType] = useState<'color' | 'pattern' | 'image'>('color')
  const [bgColor, setBgColor] = useState('#f9fafb')
  const [bgPattern, setBgPattern] = useState('clean')
  const [portalBgUrl, setPortalBgUrl] = useState<string | null>(null)
  const [walletHeroUrl, setWalletHeroUrl] = useState<string | null>(null)

  // Stamp State
  const [stampType, setStampType] = useState<'preset' | 'custom'>('preset')
  const [stampPreset, setStampPreset] = useState('star')
  const [stampCustomUrl, setStampCustomUrl] = useState<string | null>(null)
  const [emptySlotStyle, setEmptySlotStyle] = useState<'light' | 'dark' | 'translucent'>('light')

  // Loading / Uploader States
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingStamp, setIsUploadingStamp] = useState(false)
  const [isUploadingPortalBg, setIsUploadingPortalBg] = useState(false)
  const [isUploadingWalletHero, setIsUploadingWalletHero] = useState(false)

  // Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [pendingCropType, setPendingCropType] = useState<'stamp' | 'portal_bg' | 'wallet_hero' | null>(null)

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

        const { data: bData } = await supabase
          .from('businesses')
          .select(`id, store_name, business_customizations (*)`)
          .eq('auth_user_id', userData.user.id)
          .single()

        if (bData) {
          if (bData.store_name) setStoreName(bData.store_name)
          
          const custom = Array.isArray(bData.business_customizations) ? bData.business_customizations[0] : bData.business_customizations

          if (custom) {
            if (custom.logo_url) setLogoUrl(custom.logo_url)
            if (custom.primary_color) setPrimaryColor(custom.primary_color)
            if (custom.secondary_color) setSecondaryColor(custom.secondary_color)
            
            if (custom.bg_type) setBgType(custom.bg_type as any)
            if (custom.bg_color) setBgColor(custom.bg_color)
            if (custom.bg_pattern) setBgPattern(custom.bg_pattern)
            if (custom.portal_bg_image_url) setPortalBgUrl(custom.portal_bg_image_url)
            if (custom.wallet_hero_image_url) setWalletHeroUrl(custom.wallet_hero_image_url)

            if (custom.stamp_type) setStampType(custom.stamp_type as any)
            if (custom.stamp_preset) setStampPreset(custom.stamp_preset)
            if (custom.stamp_custom_url) setStampCustomUrl(custom.stamp_custom_url)
            if (custom.empty_slot_style) setEmptySlotStyle(custom.empty_slot_style as any)
          }
        }
      } catch (err) {
        console.error('Failed to load customizations', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomizations()
  }, [supabase])

  const deleteImageFromBucket = async (url: string | null) => {
    if (!url || !url.includes('store-logos/')) return 
    try {
      const fileName = url.split('store-logos/')[1]
      if (fileName) await supabase.storage.from('store-logos').remove([fileName])
    } catch (err) {
      console.error("Failed to delete image:", err)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingLogo(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      // 1. Explicitly check for the user ID to satisfy TypeScript
      if (!userData?.user?.id) throw new Error('Not authenticated')
      
      // Fallback to 'png' if the extension is somehow missing
      const fileExt = file.name.split('.').pop() || 'png' 
      const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`

      if (logoUrl) await deleteImageFromBucket(logoUrl)

      const { error } = await supabase.storage.from('store-logos').upload(fileName, file)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('store-logos').getPublicUrl(fileName)
      setLogoUrl(publicUrl)
    } catch (err: any) {
      setErrorMsg('Failed to upload logo.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const uploadToSupabase = async (file: File, type: 'stamp' | 'portal_bg' | 'wallet_hero') => {
    if (!file) return

    if (type === 'stamp') setIsUploadingStamp(true)
    if (type === 'portal_bg') setIsUploadingPortalBg(true)
    if (type === 'wallet_hero') setIsUploadingWalletHero(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      // 1. Explicitly check for the user ID to satisfy TypeScript
      if (!userData?.user?.id) throw new Error('Not authenticated')
      
      let oldUrl = null
      if (type === 'stamp') oldUrl = stampCustomUrl
      if (type === 'portal_bg') oldUrl = portalBgUrl
      if (type === 'wallet_hero') oldUrl = walletHeroUrl
      
      await deleteImageFromBucket(oldUrl)

      const fileName = `${userData.user.id}-${type}-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('store-logos').upload(fileName, file, { upsert: true, contentType: file.type })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('store-logos').getPublicUrl(fileName)

      if (type === 'stamp') setStampCustomUrl(publicUrl)
      if (type === 'portal_bg') setPortalBgUrl(publicUrl)
      if (type === 'wallet_hero') setWalletHeroUrl(publicUrl)

    } catch (error: any) {
      alert(`Failed to upload ${type}.`)
    } finally {
      if (type === 'stamp') setIsUploadingStamp(false)
      if (type === 'portal_bg') setIsUploadingPortalBg(false)
      if (type === 'wallet_hero') setIsUploadingWalletHero(false)
    }
  }

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'stamp' | 'portal_bg' | 'wallet_hero') => {
    if (e.target.files && e.target.files.length > 0) {
      setImageSrc(URL.createObjectURL(e.target.files[0]))
      setPendingCropType(type)
      setCropModalOpen(true)
      e.target.value = '' 
    }
  }

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels || !pendingCropType) return
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, pendingCropType)
      setCropModalOpen(false) 
      await uploadToSupabase(croppedFile, pendingCropType)
    } catch (e) {
      alert('Failed to crop image.')
    }
  }

  const handleSaveCustomization = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')

    try {
      const { data: userData } = await supabase.auth.getUser()
      
      // 1. Explicitly check for the user ID to satisfy TypeScript
      if (!userData?.user?.id) throw new Error('Not authenticated')

      // 2. Now userData.user.id is guaranteed to be a string
      const { data: bData } = await supabase
        .from('businesses')
        .select('id')
        .eq('auth_user_id', userData.user.id) 
        .single()
        
      if (!bData) throw new Error('Business not found')

      const { error } = await supabase.from('business_customizations').upsert({ 
        business_id: bData.id,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        bg_type: bgType,
        bg_color: bgColor,
        bg_pattern: bgPattern,
        portal_bg_image_url: portalBgUrl,
        wallet_hero_image_url: walletHeroUrl,
        stamp_type: stampType,
        stamp_preset: stampPreset,
        stamp_custom_url: stampCustomUrl,
        empty_slot_style: emptySlotStyle
      }, { onConflict: 'business_id' })
        
      if (error) {
        console.error("UPSERT ERROR:", error)
        throw new Error(error.message)
      }

      // Sync specific fields to Google Wallet Generator
      await fetch('/api/wallet/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bData.id
        })
      })

      setToastMessage('Global Brand Kit Saved Successfully!')
      setTimeout(() => setToastMessage(''), 3000)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // --- PREVIEW HELPERS ---
  const getUnifiedBgStyle = (isPortal: boolean) => {
    if (bgType === 'image') {
      const url = isPortal ? portalBgUrl : walletHeroUrl
      return url ? { backgroundImage: `url('${url}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: bgColor }
    }
    return { backgroundColor: bgColor }
  }

  const getUnifiedPatternClass = () => {
    if (bgType !== 'pattern') return ''
    if (bgPattern === 'dots') return 'bg-[radial-gradient(rgba(0,0,0,0.1)_2px,transparent_2px)] [background-size:16px_16px]'
    if (bgPattern === 'grid') return 'bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:24px_24px]'
    if (bgPattern === 'diagonal') return 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.03)_10px,rgba(0,0,0,0.03)_20px)]'
    return ''
  }

  const PreviewStampIcon = StampIconMap[stampPreset] || Star

  return (
    <>
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Brand Kit Customization</h2>
          <p className="text-gray-500 mt-2">Design your unified visual identity for the customer portal and wallet passes.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-500 animate-pulse font-medium">Loading Brand Kit...</div>
        ) : (
          <form onSubmit={handleSaveCustomization} className="grid lg:grid-cols-12 gap-10">
            
            {/* --- LEFT COLUMN: UNIFIED SETTINGS --- */}
            <div className="lg:col-span-7 space-y-8 animate-in fade-in duration-300">
              
              {/* 1. Brand Identity */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">1. Brand Identity</h3>
                
                <div className="space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">Store Logo</label>
                    <div className="flex items-center gap-6">
                      {logoUrl ? (
                        <div className="relative w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl p-2 shadow-sm">
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          <button type="button" onClick={() => { deleteImageFromBucket(logoUrl); setLogoUrl(null) }} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400">
                          <Layout className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-colors inline-block ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Primary Color</label>
                      <p className="text-xs text-gray-500 mb-3">Used for Portal buttons and Wallet Card background.</p>
                      <div className="flex items-center text-black gap-3 mb-3">
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer p-0.5 bg-white border border-gray-400 shrink-0" />
                        <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">{primaryColor}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS.map(hex => (
                          <button key={hex} type="button" onClick={() => setPrimaryColor(hex)} className="w-6 h-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110" style={{ backgroundColor: hex }} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Secondary Color</label>
                      <p className="text-xs text-gray-500 mb-3">Used for Wallet Pass text and icons to contrast Primary.</p>
                      <div className="flex text-black items-center gap-3 mb-3">
                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer p-0.5 bg-white border border-gray-400 shrink-0" />
                        <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200">{secondaryColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Global Background Engine */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">2. Visual Theme (Backgrounds)</h3>
                
                <div className="flex gap-3 mb-5 p-1 bg-gray-100 rounded-lg w-fit">
                  {['color', 'pattern', 'image'].map((type) => (
                    <button 
                      key={type} type="button" onClick={() => {
                        setBgType(type as any)
                        if (bgType === 'image' && type !== 'image') {
                          deleteImageFromBucket(portalBgUrl); setPortalBgUrl(null)
                          deleteImageFromBucket(walletHeroUrl); setWalletHeroUrl(null)
                        }
                      }}
                      className={`px-5 py-2 text-sm font-bold rounded-md capitalize transition-colors ${bgType === type ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  {bgType === 'color' || bgType === 'pattern' ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-2">Base Color</label>
                        <div className="flex text-black items-center gap-3">
                          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer p-0.5 bg-white border border-gray-300" />
                          <span className="font-mono text-sm">{bgColor}</span>
                        </div>
                      </div>
                      
                      {bgType === 'pattern' && (
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-gray-700 mb-2">Texture Pattern</label>
                          <select value={bgPattern} onChange={(e) => setBgPattern(e.target.value)} className="w-full rounded-lg text-black border border-gray-300 px-3 py-2 text-sm">
                            <option value="clean">Clean Texture</option>
                            <option value="dots">Modern Dots</option>
                            <option value="grid">Subtle Grid</option>
                            <option value="diagonal">Diagonal Lines</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600 mb-2">Because device shapes differ, image backgrounds require two uploads.</p>
                      
                      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900">Portal Background</h4>
                          <p className="text-xs text-gray-500 mb-2">Portrait (9:16)</p>
                          <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer inline-block ${isUploadingPortalBg ? 'opacity-50' : ''}`}>
                            {isUploadingPortalBg ? 'Uploading...' : 'Upload Portal Img'}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileSelect(e, 'portal_bg')} disabled={isUploadingPortalBg} />
                          </label>
                        </div>
                        {portalBgUrl && <img src={portalBgUrl} className="w-12 h-20 object-cover rounded shadow-sm border border-gray-200" alt="Portal bg" />}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-gray-900">Wallet Pass Banner (Strip)</h4>
                          <p className="text-xs text-gray-500 mb-2">Landscape (1036x336)</p>
                          <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer inline-block ${isUploadingWalletHero ? 'opacity-50' : ''}`}>
                            {isUploadingWalletHero ? 'Uploading...' : 'Upload Banner Img'}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileSelect(e, 'wallet_hero')} disabled={isUploadingWalletHero} />
                          </label>
                        </div>
                        {walletHeroUrl && <img src={walletHeroUrl} className="w-24 h-8 object-cover rounded shadow-sm border border-gray-200" alt="Wallet bg" />}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 3. Loyalty Stamp Engine */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">3. Loyalty Stamp Graphic</h3>

                <div className="flex gap-3 mb-5 p-1 bg-gray-100 rounded-lg w-fit">
                  <button type="button" onClick={() => setStampType('preset')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${stampType === 'preset' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Preset Icon</button>
                  <button type="button" onClick={() => setStampType('custom')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${stampType === 'custom' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Custom Upload</button>
                </div>

                {stampType === 'preset' ? (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-6">
                    {Object.keys(StampIconMap).map((key) => {
                      const Icon = StampIconMap[key]
                      return (
                        <button key={key} type="button" onClick={() => setStampPreset(key)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${stampPreset === key ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 hover:bg-gray-50 text-gray-500'}`}>
                          <Icon className="w-6 h-6" />
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-5 p-4 rounded-xl border border-gray-200 bg-gray-50 mb-6">
                    <div className="w-16 h-16 bg-white rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                      {stampCustomUrl ? <img src={stampCustomUrl} alt="Stamp" className="w-10 h-10 object-contain" /> : <Star className="w-8 h-8 text-gray-300" />}
                    </div>
                    <div>
                      <label className={`bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer inline-block ${isUploadingStamp ? 'opacity-50' : ''}`}>
                        {isUploadingStamp ? 'Uploading...' : 'Upload Custom Stamp'}
                        <input type="file" accept="image/png, image/svg+xml" className="hidden" onChange={(e) => onFileSelect(e, 'stamp')} disabled={isUploadingStamp} />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Square PNG/SVG required.</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Unearned Slot Style</label>
                  <select value={emptySlotStyle} onChange={(e) => setEmptySlotStyle(e.target.value as any)} className="w-full text-black sm:w-1/2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium">
                    <option value="light">Light Outline (Best for dark backgrounds)</option>
                    <option value="dark">Dark Outline (Best for light backgrounds)</option>
                    <option value="translucent">Soft Frosted Fill</option>
                  </select>
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors w-full lg:w-auto shadow-md disabled:opacity-50 active:scale-95">
                  {isSaving ? 'Saving Brand Kit...' : 'Save & Publish'}
                </button>
              </div>

            </div>

            {/* --- RIGHT COLUMN: LIVE CROSS-PLATFORM PREVIEW --- */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="sticky top-8 flex flex-col items-center">
                
                {/* Preview Toggle Switch */}
                <div className="flex bg-gray-200/80 backdrop-blur-sm p-1 rounded-xl mb-6 w-full max-w-sm mx-auto border border-gray-300/50 shadow-inner">
                  <button type="button" onClick={() => setPreviewMode('portal')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${previewMode === 'portal' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Layout className="w-4 h-4" /> Web Portal
                  </button>
                  <button type="button" onClick={() => setPreviewMode('wallet')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${previewMode === 'wallet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Wallet className="w-4 h-4" /> Wallet Pass
                  </button>
                </div>

                {/* --- PORTAL PREVIEW --- */}
                {previewMode === 'portal' && (
                  <div className="w-[340px] h-[670px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl relative border-4 border-gray-800 animate-in zoom-in-95 duration-300">
                    <div className="absolute inset-0 m-3 rounded-[2.5rem] overflow-hidden bg-white">
                      {/* Dynamic Portal Background */}
                      <div className="absolute inset-0 transition-all duration-500" style={getUnifiedBgStyle(true)}>
                        <div className={`absolute inset-0 ${getUnifiedPatternClass()}`}></div>
                      </div>
                      
                      <div className="relative z-10 h-full flex flex-col items-center p-5 overflow-y-auto">
                        <div className="mt-8 mb-4 flex flex-col items-center">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-2xl mb-3 bg-white p-2 border border-gray-100 shadow-sm" />
                          ) : (
                            <div className="w-16 h-16 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center mb-3">
                              <span className="font-black text-2xl text-gray-400">{(storeName || 'S').charAt(0)}</span>
                            </div>
                          )}
                          <h1 className="text-2xl font-black text-gray-900 tracking-tight text-center">{storeName}</h1>
                        </div>

                        {/* Customer Loyalty Card UI inside Portal */}
                        <div className="bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl p-6 w-full shadow-xl text-center">
                          <p className="text-xs font-bold text-gray-500 mb-6">3 / 10 Stamps Collected</p>
                          
                          <div className="grid grid-cols-5 gap-3 mb-6 max-w-[240px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                              const isEarned = idx <= 3
                              return (
                                <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center p-2 transition-all ${isEarned ? 'shadow-md' : 'bg-gray-100 border-2 border-dashed border-gray-300'}`} style={isEarned ? { backgroundColor: primaryColor, color: secondaryColor } : {}}>
                                  {stampType === 'custom' && stampCustomUrl ? (
                                    <img src={stampCustomUrl} alt="stamp" className={`w-full h-full object-contain ${!isEarned ? 'opacity-0' : ''}`} />
                                  ) : (
                                    isEarned && <PreviewStampIcon className="w-full h-full stroke-[2.5]" />
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          <button className="w-full py-3 rounded-xl font-bold text-sm shadow-md transition-colors" style={{ backgroundColor: primaryColor, color: secondaryColor }}>
                            Scan Store QR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- WALLET PREVIEW --- */}
                {previewMode === 'wallet' && (
                  <div className="w-[340px] h-[670px] bg-transparent flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                    <div className="relative w-full max-w-[320px] aspect-[1/1.7] rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 border border-black/5" style={{ backgroundColor: primaryColor }}>
                      
                      {/* Apple/Google Header */}
                      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-10" style={{ color: secondaryColor }}>
                        <div className="flex items-center gap-3">
                          {logoUrl ? (
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0"><img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /></div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0"><span className="font-bold text-lg leading-none">{(storeName || 'S').charAt(0)}</span></div>
                          )}
                          <span className="font-bold text-lg truncate opacity-90">{storeName}</span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="absolute inset-0 pt-20 pb-5 flex flex-col items-center">
                        
                        {/* Dynamic Hero Strip */}
                        <div className="w-full h-28 overflow-hidden shadow-sm shrink-0 relative transition-all duration-500" style={getUnifiedBgStyle(false)}>
                          <div className={`absolute inset-0 transition-opacity duration-300 ${getUnifiedPatternClass()}`}></div>
                          
                          {/* Live Wallet Stamp Grid */}
                          <div className="absolute inset-0 flex items-center justify-center gap-2 px-3">
                            {[1, 2, 3, 4, 5].map((idx) => {
                              const isFilled = idx <= 3
                              const slotStyle = !isFilled 
                                ? emptySlotStyle === 'light' ? 'border-2 border-white/60' 
                                : emptySlotStyle === 'dark' ? 'border-2 border-black/30 bg-black/10' 
                                : 'bg-white/40 border-none' 
                                : ''
                              return (
                                <div key={idx} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative ${slotStyle}`}>
                                  {isFilled && (
                                    stampType === 'custom' && stampCustomUrl ? (
                                      <img src={stampCustomUrl} alt="Stamp" className="w-7 h-7 object-contain drop-shadow-md" />
                                    ) : (
                                      <PreviewStampIcon className="w-6 h-6 text-white drop-shadow-md" />
                                    )
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        
                        <div className="flex-1 w-full px-6 py-5 text-center">
                          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1" style={{ color: secondaryColor }}>Progress</p>
                          <p className="text-2xl font-bold tracking-tight" style={{ color: secondaryColor }}>3 / 5 Stamps</p>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white w-28 rounded-xl p-2 shadow-lg mb-2">
                          <svg className="w-full h-24 text-black" viewBox="1 0 22 22" fill="currentColor"><path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zM15 5v4h4V5zM3 13h8v8H3zM5 15v4h4v-4zM18 13h3v3h-3zM13 13h3v3h-3zM15 18h3v3h-3zM18 16h3v3h-3zM13 18h2v3h-2z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </form>
        )}
      </div>

      {/* CROP MODAL UI */}
      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Crop Your Image</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="relative h-[60vh] w-full bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={pendingCropType === 'wallet_hero' ? 1036 / 336 : pendingCropType === 'portal_bg' ? 9 / 16 : 1} 
                onCropChange={setCrop}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full sm:w-1/2" />
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => setCropModalOpen(false)} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button onClick={handleConfirmCrop} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-md">Confirm & Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}