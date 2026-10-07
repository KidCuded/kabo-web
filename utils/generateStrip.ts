// utils/generateStrip.ts
import { createClient } from '@supabase/supabase-js'
import { createCanvas, loadImage } from '@napi-rs/canvas'

export async function generateStripBuffer(businessId: string, currentStamps: number): Promise<Buffer> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1. Fetch Brand Kit and Loyalty Rules
  const { data: bData } = await supabase
    .from('businesses')
    .select(`
      business_customizations ( bg_type, bg_color, wallet_hero_image_url, empty_slot_style, stamp_type, stamp_custom_url, secondary_color ),
      loyalty_rules ( stamp_threshold )
    `)
    .eq('id', businessId)
    .single()

  if (!bData) throw new Error('Business not found')

  const custom = Array.isArray(bData.business_customizations) ? bData.business_customizations[0] : bData.business_customizations
  const rules = Array.isArray(bData.loyalty_rules) ? bData.loyalty_rules[0] : bData.loyalty_rules
  
  const threshold = rules?.stamp_threshold || 10
  const width = 1036
  const height = 336

  // 2. Initialize Canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // 3. Draw Background
  if (custom?.bg_type === 'image' && custom?.wallet_hero_image_url) {
    try {
      const bgImg = await loadImage(custom.wallet_hero_image_url)
      ctx.drawImage(bgImg, 0, 0, width, height)
    } catch (e) {
      ctx.fillStyle = custom?.bg_color || '#1e293b'
      ctx.fillRect(0, 0, width, height)
    }
  } else {
    ctx.fillStyle = custom?.bg_color || '#1e293b'
    ctx.fillRect(0, 0, width, height)
  }

  // 4. Grid Math
  const cols = threshold <= 6 ? threshold : Math.ceil(threshold / 2)
  const rows = threshold <= 6 ? 1 : 2
  const slotRadius = threshold > 8 ? 35 : 45
  
  const gapX = width / (cols + 1)
  const gapY = height / (rows + 1)

  // Pre-load custom stamp image if needed
  let customStampImg: any = null
  if (custom?.stamp_type === 'custom' && custom?.stamp_custom_url) {
    try {
      customStampImg = await loadImage(custom.stamp_custom_url)
    } catch (e) { console.error("Failed to load custom stamp") }
  }

  // 5. Draw Slots and Stamps
  let stampCount = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (stampCount >= threshold) break

      const x = gapX * (c + 1)
      const y = gapY * (r + 1)

      // Draw Empty Slot
      ctx.beginPath()
      ctx.arc(x, y, slotRadius, 0, Math.PI * 2)
      
      if (custom?.empty_slot_style === 'dark') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.lineWidth = 3
        ctx.stroke()
      } else if (custom?.empty_slot_style === 'translucent') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fill()
      } else {
        // Default Light
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Draw Earned Stamp
      if (stampCount < currentStamps) {
        if (customStampImg) {
          const imgSize = slotRadius * 1.5
          ctx.drawImage(customStampImg, x - (imgSize/2), y - (imgSize/2), imgSize, imgSize)
        } else {
          // Fallback Default Star Drawing
          ctx.fillStyle = custom?.secondary_color || '#ffffff'
          ctx.shadowColor = 'rgba(0,0,0,0.3)'
          ctx.shadowBlur = 10
          drawStar(ctx, x, y, 5, slotRadius * 0.7, slotRadius * 0.35)
          ctx.shadowBlur = 0 // reset
        }
      }
      stampCount++
    }
  }

  return canvas.toBuffer('image/png')
}

// Native Canvas Star Path helper
function drawStar(ctx: any, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = Math.PI / 2 * 3
  let x = cx
  let y = cy
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius
    y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step
    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }
  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}