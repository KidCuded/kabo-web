// app/dashboard/qr-code/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'

export default function QRCodePage() {
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [storeName, setStoreName] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchBusinessData() {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data: businessData } = await supabase
          .from('businesses')
          .select('id, store_name')
          .eq('auth_user_id', userData.user.id)
          .single()

        if (businessData) {
          setBusinessId(businessData.id)
          setStoreName(businessData.store_name)
        }
      } catch (err) {
        console.error('Failed to load business data', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBusinessData()
  }, [])

  // Automatically construct the correct URL based on where the app is hosted
  const storeUrl = typeof window !== 'undefined' && businessId
    ? `${window.location.origin}/store/${businessId}`
    : ''

  // Function to download the QR code as a PNG file
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (!canvas) return
    
    // Convert the canvas to a downloadable image URL
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    
    // Create a temporary link and trigger the download
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `${storeName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Store QR Code</h2>

      {isLoading ? (
        <div className="text-gray-500 animate-pulse">Loading your QR Code...</div>
      ) : !businessId ? (
        <div className="text-red-600">Error: Could not locate your business profile.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center flex flex-col items-center">
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Print this for your counter
          </h3>
          <p className="text-gray-500 mb-8 max-w-md text-sm">
            Customers can scan this code with their smartphone camera to instantly view their digital stamp card for <strong>{storeName}</strong>.
          </p>

          {/* The QR Code Canvas */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 inline-block">
            <QRCodeCanvas
              id="qr-canvas"
              value={storeUrl}
              size={250}
              bgColor={"#ffffff"}
              fgColor={"#111827"} // Dark gray/black for high contrast
              level={"H"}         // High error correction so it works even if slightly damaged
              includeMargin={false}
            />
          </div>

          <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-50 py-2 px-4 rounded-lg select-all">
            {storeUrl}
          </p>

          <button
            onClick={downloadQRCode}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download QR Code
          </button>
          
        </div>
      )}
    </div>
  )
}