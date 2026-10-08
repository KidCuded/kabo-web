// utils/cropImage.ts
export const getCroppedImg = async (imageSrc: string, pixelCrop: any, pendingCropType: string): Promise<File> => {
  const image = new Image()
  image.src = imageSrc
  await new Promise((resolve) => (image.onload = resolve))

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2d context')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  if (pendingCropType === 'stamp') {
    ctx.beginPath()
    const radius = Math.min(canvas.width, canvas.height) / 2
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.clip()
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        // Convert Blob to File to match your existing Supabase upload logic
        resolve(new File([blob], 'cropped.png', { type: 'image/png' }))
      } else {
        reject(new Error('Canvas is empty'))
      }
    }, 'image/png', 0.95)
  })
}