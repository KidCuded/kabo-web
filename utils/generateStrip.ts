// utils/generateStrip.ts
import { createClient } from '@supabase/supabase-js'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'

// Module-level icon directory and cache (persist across invocations in the same process)
const ICON_DIR = path.join(process.cwd(), 'public', 'icons')
const iconCache = new Map<string, any>()

// Optional mapping from DB stamp_type values -> SVG filenames (without .svg).
const ICON_KEY_MAP: Record<string, string> = {
  // common variants -> file name
  'shopping_bag': 'bag',
  'star': 'star',
  'coffee': 'coffee',
  'scissors': 'scissors',
  'pizza': 'pizza',
  'award': 'award',
  'heart': 'heart'
}

export async function generateStripBuffer(businessId: string, currentStamps: number): Promise<Buffer> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1. Fetch Brand Kit and Loyalty Rules
  const { data: bData } = await supabase
    .from('businesses')
    .select(`
      business_customizations ( bg_type, bg_pattern, bg_color, wallet_hero_image_url, empty_slot_style, stamp_type, stamp_preset, stamp_custom_url, secondary_color ),
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

  // 4. Draw Background Patterns
  if (custom?.bg_type === 'pattern' && custom?.bg_pattern) {
    if (custom.bg_pattern === 'dots') {
      // Replicates: radial-gradient(rgba(0,0,0,0.1) 2px, transparent 2px) size: 16px
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      for (let x = 0; x < width; x += 16) {
        for (let y = 0; y < height; y += 16) {
          ctx.beginPath()
          // x + 8 and y + 8 centers the 2px dot in the 16x16 grid cell
          ctx.arc(x + 8, y + 8, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } 
    else if (custom.bg_pattern === 'grid') {
      // Replicates: 1px grid lines every 24px
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.lineWidth = 1
      ctx.beginPath()
      // Draw vertical lines
      for (let x = 0; x < width; x += 36) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      // Draw horizontal lines
      for (let y = 0; y < height; y += 36) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()
    } 
    else if (custom.bg_pattern === 'diagonal') {
      // Replicates: 45deg repeating stripes, 10px transparent, 10px color
      ctx.save() // Save context state before rotating
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      
      // Rotate canvas -45 degrees
      ctx.rotate((-45 * Math.PI) / 180)
      
      // Calculate diagonal length to ensure stripes cover the whole rotated canvas
      const diag = Math.sqrt(width * width + height * height)
      
      // Draw 10px wide rectangles every 20px
      for (let i = -diag; i < diag * 2; i += 40) {
        // Changing 10 to 20 makes the line itself twice as wide
        ctx.fillRect(i, -diag, 20, diag * 2)
      }
      ctx.restore() // Restore context so the stamps draw normally!
    }
  }


  // 5. Grid Math
  const cols = threshold <= 6 ? threshold : Math.ceil(threshold / 2)
  const rows = threshold <= 6 ? 1 : 2
  const slotRadius = threshold > 8 ? 40 : 50
  
  // -- Hero Image gap between stamp icons
  const gapX = width / (cols + 1)
  const gapY = height / (rows + 1)

  // Pre-load custom stamp image if needed (external custom URL)
  let customStampImg: any = null
  if (custom?.stamp_type === 'custom' && custom?.stamp_custom_url) {
    try {
      customStampImg = await loadImage(custom.stamp_custom_url)
    } catch (e) { console.error("Failed to load custom stamp", e) }
  }

  /**
   * Load an SVG icon file from public/icons/<iconKey>.svg, optionally inject color.
   * Returns an image that @napi-rs/canvas loadImage can draw or null if it doesn't exist.
   */
  async function loadPresetIconImage(iconKey: string, size: number, color: string) {
    const cacheKey = `${iconKey}::${size}::${color}`
    if (iconCache.has(cacheKey)) return iconCache.get(cacheKey)

    const siteBase = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
    if (siteBase) {
      const url = `${siteBase}/icons/${iconKey}.svg`
      try {
        const response = await fetch(url)
        let svgText = await response.text()

        // Double the resolution for Apple Retina displays
        const targetResolution = size * 2 
        
        svgText = svgText
          // 1. Remove the hardcoded low-res dimensions
          .replace(/width="[^"]*"/, '')
          .replace(/height="[^"]*"/, '')
          // 2. Overwrite the CSS 'currentColor' placeholder with your dynamic hex/rgba string
          .replace(/currentColor/g, color)
          // 3. Re-inject the new high-res dimensions into the opening <svg> tag
          .replace(/<svg([^>]*)>/, (match, attributes) => {
            return `<svg width="${targetResolution}" height="${targetResolution}" ${attributes}>`
          })

        // Convert the dynamically modified raw string into a Canvas image buffer
        const img = await loadImage(Buffer.from(svgText))

        iconCache.set(cacheKey, img)
        if (process.env.NODE_ENV !== 'production') console.info(`generateStrip: loaded sharp, colored icon: ${url}`)
        return img
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn(`generateStrip: failed to load icon`, err)
      }
    }
  }
  

  // 6. Draw Slots and Stamps
  let stampCount = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (stampCount >= threshold) break

      const x = gapX * (c + 1)
      let y = gapY * (r + 1)

      // Add extra spacing if there are 2 rows
      if (rows === 2) {
        const spreadOffset = 14; // Increase this number to push rows further apart
        // If row 0, move it up (-). If row 1, move it down (+)
        y += (r === 0) ? -spreadOffset : spreadOffset;
      }

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
          const imgSize = slotRadius * 1.7
          ctx.drawImage(customStampImg, x - (imgSize/2), y - (imgSize/2), imgSize, imgSize)
        } else if (custom?.stamp_preset && custom.stamp_type !== 'custom') {
          // Resolve DB value to icon file key via ICON_KEY_MAP (fallback to the raw value)
          const rawKey = String(custom.stamp_preset)
          const resolvedKey = ICON_KEY_MAP[rawKey] ?? rawKey
          const iconSize = Math.round(slotRadius * 1.4)
          const color = custom?.secondary_color || '#ffffff'

          // Debug logging to help you see what's being used
          if (process.env.NODE_ENV !== 'production') {
            console.info(`generateStrip: requested stamp_preset="${rawKey}" resolved->"${resolvedKey}" svgExists=${fs.existsSync(path.join(ICON_DIR, `${resolvedKey}.svg`))}`)
          }

          ctx.shadowColor = 'rgba(0,0,0,0.3)'
          ctx.shadowBlur = 10
          try {
            // eslint-disable-next-line no-await-in-loop
            const iconImg = await loadPresetIconImage(resolvedKey, iconSize, color)
            if (iconImg) {
              ctx.drawImage(iconImg, x - (iconSize/2), y - (iconSize/2), iconSize, iconSize)
            } else {
              // Fallback Default Star Drawing
              ctx.fillStyle = color
              drawStar(ctx, x, y, 5, slotRadius * 0.7, slotRadius * 0.35)
            }
          } catch (err) {
            console.error('Error rendering preset icon, falling back to star', err)
            ctx.fillStyle = custom?.secondary_color || '#ffffff'
            drawStar(ctx, x, y, 5, slotRadius * 0.7, slotRadius * 0.35)
          } finally {
            ctx.shadowBlur = 0 // reset
          }
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