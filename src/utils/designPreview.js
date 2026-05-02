export const EDITOR_ASSETS = {
  baseDefault: {
    src: new URL('@/assets/editor/cross kart.png', import.meta.url).href,
    alt: 'Kart preview',
  },
  baseAlt: {
    src: new URL('@/assets/editor/42d02525-d6a6-4637-993d-68cd67d0cf19.png', import.meta.url).href,
    alt: 'Alternative kart preview',
  },
  frameBases: {
    'p-007': {
      src: new URL('@/assets/editor/tony kart frame.png', import.meta.url).href,
      alt: 'Tony Kart frame preview',
    },
    'p-008': {
      src: new URL('@/assets/editor/42d02525-d6a6-4637-993d-68cd67d0cf19.png', import.meta.url).href,
      alt: 'CRG frame preview',
    },
    'p-025': {
      src: new URL('@/assets/editor/42d02525-d6a6-4637-993d-68cd67d0cf19.png', import.meta.url).href,
      alt: 'Sodi frame preview',
    },
  },
  body: {
    Yellow: new URL('@/assets/editor/yellow body.png', import.meta.url).href,
    Black: new URL('@/assets/editor/black body.png', import.meta.url).href,
    Red: new URL('@/assets/editor/red body.png', import.meta.url).href,
  },
  wheels: {
    'p-003': new URL('@/assets/editor/yellow wheel.png', import.meta.url).href,
    'p-004': new URL('@/assets/editor/vega.png', import.meta.url).href,
    'p-026': new URL('@/assets/editor/douglas.png', import.meta.url).href,
    'p-027': new URL('@/assets/editor/lecont wheels.png', import.meta.url).href,
    'p-028': new URL('@/assets/editor/maxxis wheels.png', import.meta.url).href,
  },
  seats: {
    'p-009': new URL('@/assets/editor/blue seat.png', import.meta.url).href,
    'p-010': new URL('@/assets/editor/omp seat.png', import.meta.url).href,
    'p-019': new URL('@/assets/editor/alvey seat.png', import.meta.url).href,
    'p-020': new URL('@/assets/editor/jecko seat.png', import.meta.url).href,
    'p-021': new URL('@/assets/editor/nek seat.png', import.meta.url).href,
  },
}

export const BODY_COLOR_FILTERS = {
  White: 'saturate(0) brightness(2.35) contrast(0.88)',
  Blue: 'hue-rotate(210deg) saturate(1.2) brightness(0.92)',
  Green: 'hue-rotate(110deg) saturate(1.25) brightness(0.9)',
  Orange: 'hue-rotate(30deg) saturate(1.45) brightness(1.02)',
}

export const PREVIEW_FRAMING = {
  scale: 1.3,
  offsetX: 0,
  offsetY: -0.04,
}

function normalizeParts(parts = {}) {
  if (Array.isArray(parts)) {
    return {
      engine: parts[0] || null,
      frame: parts[1] || null,
      brake: parts[2] || null,
      wheel: parts[3] || null,
      seat: parts[4] || null,
      steering: parts[5] || null,
    }
  }

  return parts
}

export function getDesignPreviewBaseImage({ parts = {}, color = null } = {}) {
  const normalizedParts = normalizeParts(parts)

  if (normalizedParts.frame && EDITOR_ASSETS.frameBases[normalizedParts.frame]) {
    return EDITOR_ASSETS.frameBases[normalizedParts.frame]
  }

  if (color === 'Black') {
    return EDITOR_ASSETS.baseAlt
  }

  return EDITOR_ASSETS.baseDefault
}

export function getDesignPreviewLayers({ parts = {}, color = null } = {}) {
  const normalizedParts = normalizeParts(parts)
  const layers = []
  const bodySrc = color ? EDITOR_ASSETS.body[color] || EDITOR_ASSETS.body.Red : null
  const wheelSrc = normalizedParts.wheel ? EDITOR_ASSETS.wheels[normalizedParts.wheel] : null
  const seatSrc = normalizedParts.seat ? EDITOR_ASSETS.seats[normalizedParts.seat] : null

  if (bodySrc) {
    layers.push({
      key: `body-${color}`,
      src: bodySrc,
      alt: `${color} body kit`,
      filter: BODY_COLOR_FILTERS[color] || 'none',
    })
  }

  if (wheelSrc) {
    layers.push({
      key: `wheel-${normalizedParts.wheel}`,
      src: wheelSrc,
      alt: 'Selected wheels',
      filter: 'none',
    })
  }

  if (seatSrc) {
    layers.push({
      key: `seat-${normalizedParts.seat}`,
      src: seatSrc,
      alt: 'Selected seat',
      filter: 'none',
    })
  }

  return layers
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load preview asset: ${src}`))
    image.src = src
  })
}

function paintPreviewBackground(ctx, width, height) {
  ctx.clearRect(0, 0, width, height)

  const linearGradient = ctx.createLinearGradient(0, 0, width, height)
  linearGradient.addColorStop(0, 'rgba(255, 196, 0, 0.12)')
  linearGradient.addColorStop(1, 'rgba(0, 0, 0, 0.04)')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = linearGradient
  ctx.fillRect(0, 0, width, height)

  const radialGradient = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, Math.max(width, height))
  radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)')
  radialGradient.addColorStop(1, 'rgba(245, 245, 245, 0.92)')
  ctx.fillStyle = radialGradient
  ctx.fillRect(0, 0, width, height)
}

function drawFramedImage(ctx, image, width, height) {
  const drawWidth = width * PREVIEW_FRAMING.scale
  const drawHeight = height * PREVIEW_FRAMING.scale
  const x = (width - drawWidth) / 2 + (width * PREVIEW_FRAMING.offsetX)
  const y = (height - drawHeight) / 2 + (height * PREVIEW_FRAMING.offsetY)
  ctx.drawImage(image, x, y, drawWidth, drawHeight)
}

export async function generateDesignPreview(
  {
    parts = {},
    color = null,
    width = 1200,
    height = 540,
    type = 'image/png',
    quality,
  } = {},
) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not create preview canvas context.')
  }

  paintPreviewBackground(ctx, canvas.width, canvas.height)

  const baseImage = getDesignPreviewBaseImage({ parts, color })
  const layers = getDesignPreviewLayers({ parts, color })
  const assets = [baseImage, ...layers]
  const loadedImages = await Promise.all(assets.map(asset => loadImage(asset.src)))

  loadedImages.forEach((image, index) => {
    const asset = assets[index]
    ctx.save()
    ctx.filter = asset.filter || 'none'
    drawFramedImage(ctx, image, canvas.width, canvas.height)
    ctx.restore()
  })

  return canvas.toDataURL(type, quality)
}
