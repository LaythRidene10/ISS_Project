import { mockParts } from './mockdata'

// ===================== PART IMAGE URLS =====================
const PART_IMAGE_URLS = {
  'Predator 212cc Engine.jpg': '/src/assets/parts/Predator 212cc Engine.jpg',
  'TPP-212EE Engine.jpg': '/src/assets/parts/TPP-212EE Engine.jpg',
  'X30-Super-Shifter Engine.jpg': '/src/assets/parts/X30-Super-Shifter Engine.jpg',
  'rotax-125-max-engine.jpg': '/src/assets/parts/rotax-125-max-engine.jpg',
  'iame-x30-engine.jpg': '/src/assets/parts/iame-x30-engine.jpg',
  'mg-yellow-slick-tires.jpg': '/src/assets/parts/mg-yellow-slick-tires.jpg',
  'vega-xh-tires.jpg': '/src/assets/parts/vega-xh-tires.jpg',
  'Birel ART Brake System.jpg': '/src/assets/parts/Birel ART Brake System.jpg',
  'CGR V04 Brake Caliper.jpg': '/src/assets/parts/CGR V04 Brake Caliper.jpg',
  'Wilwood 120-5750 Brake Caliper.jpg': '/src/assets/parts/Wilwood 120-5750 Brake Caliper.jpg',
  'otk-front-brake-system.jpg': '/src/assets/parts/otk-front-brake-system.jpg',
  'brembo-rear-caliper.jpg': '/src/assets/parts/brembo-rear-caliper.jpg',
  'tony-kart-frame-401r.jpg': '/src/assets/parts/tony-kart-frame-401r.jpg',
  'crg-black-steel-frame.jpg': '/src/assets/parts/crg-black-steel-frame.jpg',
  'Birel RY30 Frame.webp': '/src/assets/parts/Birel RY30 Frame.webp',
  'Kosmic Mercuary Kart Frame.jpg': '/src/assets/parts/Kosmic Mercuary Kart Frame.jpg',
  'Sodi SIGMA-KZ Frame.png': '/src/assets/parts/Sodi SIGMA-KZ Frame.png',
  'Douglas Magnesium Wheels.png': '/src/assets/parts/Douglas Magnesium Wheels.png',
  'LeCont Prime Wheels.webp': '/src/assets/parts/LeCont Prime Wheels.webp',
  'Maxxis-Sport-Wheels.webp': '/src/assets/parts/Maxxis-Sport-Wheels.webp',
  'AlveyTech Seat.jpg': '/src/assets/parts/AlveyTech Seat.jpg',
  'Jecko-x-light-standard-seat.jpg': '/src/assets/parts/Jecko-x-light-standard-seat.jpg',
  'NEK Carbon Seat.jpg': '/src/assets/parts/NEK Carbon Seat.jpg',
  'tillett-t11-seat.jpg': '/src/assets/parts/tillett-t11-seat.jpg',
  'omp-ks2-seat.jpg': '/src/assets/parts/omp-ks2-seat.jpg',
  'Bolt Sterring Wheel.jpg': '/src/assets/parts/Bolt Sterring Wheel.jpg',
  'otk-steering-wheel.png': '/src/assets/parts/otk-steering-wheel.png',
  'otk-steering-wheel.jpg': '/src/assets/parts/otk-steering-wheel.jpg',
  'mychron-column-kit.jpg': '/src/assets/parts/mychron-column-kit.jpg',
}

// ===================== OVERLAY IMAGE PATHS =====================
const OVERLAY_IMAGE_PATHS = {
  // Color overlays
  'yellow body.png': '/src/assets/editor/yellow body.png',
  'black body.png': '/src/assets/editor/black body.png',
  'white body.png': '/src/assets/editor/white body.png',
  
  // Seat overlays
  'blue seat.png': '/src/assets/editor/blue seat.png',
  
  // Frame overlays
  'frame.png': '/src/assets/editor/frame.png',
  
  // Wheel overlays
  'douglas.png': '/src/assets/editor/douglas.png',
  'yellow wheel.png': '/src/assets/editor/yellow wheel.png',
  'red wheel.png': '/src/assets/editor/red wheel.png',
  'black wheel.png': '/src/assets/editor/black wheel.png',
  'vega.png': '/src/assets/editor/vega.png',
}

// Part types
export const PART_TYPES = ['engine', 'wheel', 'brake', 'frame', 'seat', 'steering']

// Color options
export const COLOR_OPTIONS = {
  'c-yellow': { name: 'Yellow', image: 'yellow body.png' },
  'c-black': { name: 'Black', image: 'black body.png' },
  'c-white': { name: 'White', image: 'white body.png' },
  'c-red': { name: 'Red', image: 'red body.png' },
}

// Design types
export const DESIGN_TYPES = ['Sprint', 'Endurance', 'Off-Road', 'Drag', 'Circuit']

// ===================== PART TO OVERLAY MAPPING =====================
// Each part ID maps to its specific overlay image filename
const PART_OVERLAY_MAP = {
  // SEATS
  'p-009': 'blue seat.png',   // Tillett T11
  'p-010': 'blue seat.png',   // OMP KS-2
  'p-019': 'blue seat.png',   // AlveyTech
  'p-020': 'blue seat.png',   // Jecko X-Light
  'p-021': 'blue seat.png',   // NEK Carbon

  // FRAMES
  'p-007': 'frame.png',       // Tony Kart 401R
  'p-008': 'frame.png',       // CRG Black Steel
  'p-023': 'frame.png',       // Birel RY30
  'p-024': 'frame.png',       // Kosmic Mercuary
  'p-025': 'frame.png',       // Sodi SIGMA-KZ

  // WHEELS - Each wheel has its own unique overlay
  'p-003': 'yellow wheel.png',  // MG Yellow Slick Tires
  'p-004': 'vega.png',  // Vega XH Tires
  'p-026': 'douglas.png',       // Douglas Magnesium
  'p-027': 'yellow wheel.png',  // LeCont Prime
  'p-028': 'yellow wheel.png',  // Maxxis Sport
}

// ===================== COMPATIBILITY RULES =====================
export const COMPATIBILITY_RULES = {
  engine: {
    'p-001': { frame: ['p-007', 'p-024'], brake: ['p-005', 'p-006', 'p-016', 'p-017', 'p-018'] },
    'p-002': { frame: ['p-007', 'p-023', 'p-024'], brake: ['p-005', 'p-016', 'p-017', 'p-018'] },
    'p-013': { frame: ['p-008', 'p-025'], brake: ['p-005'] },
    'p-014': { frame: ['p-008', 'p-024', 'p-025'], brake: ['p-005', 'p-016', 'p-017'] },
    'p-015': { frame: ['p-007', 'p-023', 'p-024'], brake: ['p-016', 'p-017', 'p-018'] },
  },
  frame: {
    'p-007': { engine: ['p-001', 'p-002', 'p-015'], brake: ['p-005', 'p-006', 'p-016', 'p-017', 'p-018'], wheel: ['p-003', 'p-026', 'p-027'] },
    'p-008': { engine: ['p-013', 'p-014'], brake: ['p-005', 'p-016', 'p-017'], wheel: ['p-004', 'p-028'] },
    'p-023': { engine: ['p-002', 'p-015'], brake: ['p-016', 'p-017', 'p-018'], wheel: ['p-026', 'p-027'] },
    'p-024': { engine: ['p-001', 'p-002', 'p-014', 'p-015'], brake: ['p-005', 'p-017', 'p-018'], wheel: ['p-003', 'p-026', 'p-027', 'p-028'] },
    'p-025': { engine: ['p-013', 'p-014'], brake: ['p-005'], wheel: ['p-004', 'p-028'] },
  },
  brake: {
    'p-005': { frame: ['p-007', 'p-008', 'p-024', 'p-025'], engine: ['p-001', 'p-002', 'p-013', 'p-014', 'p-015'] },
    'p-006': { frame: ['p-007'], engine: ['p-001'] },
    'p-016': { frame: ['p-007', 'p-023', 'p-024'], engine: ['p-002', 'p-014', 'p-015'] },
    'p-017': { frame: ['p-007', 'p-008', 'p-023', 'p-024'], engine: ['p-002', 'p-014', 'p-015'] },
    'p-018': { frame: ['p-007', 'p-023', 'p-024'], engine: ['p-001', 'p-002', 'p-015'] },
  },
  wheel: {
    'p-003': { frame: ['p-007', 'p-024'] },
    'p-004': { frame: ['p-008', 'p-025'] },
    'p-026': { frame: ['p-007', 'p-023', 'p-024'] },
    'p-027': { frame: ['p-007', 'p-023', 'p-024'] },
    'p-028': { frame: ['p-008', 'p-024', 'p-025'] },
  },
  seat: {
    'p-009': { frame: ['p-007', 'p-023', 'p-024'] },
    'p-010': { frame: ['p-008', 'p-025'] },
    'p-019': { frame: ['p-008', 'p-025'] },
    'p-020': { frame: ['p-007', 'p-023', 'p-024'] },
    'p-021': { frame: ['p-007', 'p-023', 'p-024'] },
  },
  steering: {
    'p-011': { frame: ['p-007', 'p-008', 'p-023', 'p-024', 'p-025'] },
    'p-012': { frame: ['p-007'] },
    'p-022': { frame: ['p-023', 'p-024'] },
  },
}

export class Part {
  constructor({
    ID,
    name,
    type,
    image = '',
    price = 0,
    description = '',
    serialNumber,
    compatibility = true,
    availability = true,
    supplier = null,
    compatRules = {},
  }) {
    this.ID = ID ?? crypto.randomUUID()
    this.name = name
    this.type = type
    this.image = image
    this.price = price
    this.description = description
    this.serialNumber = serialNumber ?? `SN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    this.compatibility = compatibility
    this.availability = availability
    this.supplier = supplier
    this.compatRules = compatRules
  }
}

const STORAGE_KEY = 'kartbuilder_parts'
const STORAGE_VERSION_KEY = 'kartbuilder_parts_version'
const CURRENT_VERSION = '2.1'

function resolvePartImage(image) {
  if (!image) return ''
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('/')) {
    return image
  }
  return PART_IMAGE_URLS[image] ?? image
}

function normalizePart(part) {
  return {
    ...part,
    image: resolvePartImage(part.image),
  }
}

function loadData() {
  const storedVersion = sessionStorage.getItem(STORAGE_VERSION_KEY)
  const data = sessionStorage.getItem(STORAGE_KEY)
  const normalizedParts = mockParts.map(normalizePart)

  if (storedVersion !== CURRENT_VERSION || !data) {
    sessionStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedParts))
    return normalizedParts
  }

  if (data) {
    const storedParts = JSON.parse(data).map(normalizePart)
    const existingIds = new Set(storedParts.map(part => part.ID))
    const missingDefaultParts = normalizedParts.filter(part => !existingIds.has(part.ID))

    if (missingDefaultParts.length > 0) {
      const mergedParts = [...storedParts, ...missingDefaultParts]
      saveData(mergedParts)
      return mergedParts
    }
    return storedParts
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedParts))
  return normalizedParts
}

function saveData(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function addPart(part) {
  const list = loadData()
  list.push(part)
  saveData(list)
  return part
}

export function getAllParts() {
  return loadData()
}

export function getPartById(ID) {
  return loadData().find(p => p.ID === ID) || null
}

export function getPartsByType(type) {
  return loadData().filter(p => p.type === type)
}

export function updatePartById(ID, updatedData) {
  const list = loadData()
  const part = list.find(p => p.ID === ID)
  if (!part) return null
  Object.assign(part, updatedData)
  saveData(list)
  return part
}

export function deletePartById(ID) {
  const list = loadData()
  const index = list.findIndex(p => p.ID === ID)
  if (index === -1) return null
  const deleted = list[index]
  list.splice(index, 1)
  saveData(list)
  return deleted
}

export function checkCompatibility(part1, part2) {
  if (!part1 || !part2) return { compatible: true }

  const part1Rules = COMPATIBILITY_RULES[part1.type]?.[part1.ID]
  if (part1Rules) {
    const allowedParts = part1Rules[part2.type]
    if (allowedParts && !allowedParts.includes(part2.ID)) {
      return {
        compatible: false,
        reason: `${part1.name} is not compatible with ${part2.name}`,
      }
    }
  }

  const part2Rules = COMPATIBILITY_RULES[part2.type]?.[part2.ID]
  if (part2Rules) {
    const allowedParts = part2Rules[part1.type]
    if (allowedParts && !allowedParts.includes(part1.ID)) {
      return {
        compatible: false,
        reason: `${part2.name} is not compatible with ${part1.name}`,
      }
    }
  }

  return { compatible: true }
}

export function validatePartsSelection(selectedParts) {
  const incompatiblePairs = []
  const partIds = Object.values(selectedParts).filter(Boolean)
  const parts = partIds.map(id => getPartById(id)).filter(Boolean)

  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const result = checkCompatibility(parts[i], parts[j])
      if (!result.compatible) {
        incompatiblePairs.push({
          parts: [parts[i].name, parts[j].name],
          reason: result.reason,
        })
      }
    }
  }

  return {
    valid: incompatiblePairs.length === 0,
    incompatiblePairs,
  }
}

export function getCompatibleParts(partType, selectedParts = {}) {
  const allParts = getPartsByType(partType)
  const otherParts = Object.entries(selectedParts)
    .filter(([type]) => type !== partType)
    .map(([, id]) => getPartById(id))
    .filter(Boolean)

  if (otherParts.length === 0) return allParts

  return allParts.filter(part => {
    return otherParts.every(other => {
      const result = checkCompatibility(part, other)
      return result.compatible
    })
  })
}

// ===================== OVERLAY IMAGE HELPERS =====================
// These functions return the correct overlay image URL based on selected part

export function getColorOverlayUrl(colorId) {
  if (!colorId || !COLOR_OPTIONS[colorId]) return ''
  const imageName = COLOR_OPTIONS[colorId].image
  return OVERLAY_IMAGE_PATHS[imageName] || ''
}

export function getSeatOverlayUrl(partId) {
  if (!partId) return ''
  const imageName = PART_OVERLAY_MAP[partId]
  if (!imageName) {
    console.warn(`⚠️ No seat overlay found for part: ${partId}`)
    return ''
  }
  return OVERLAY_IMAGE_PATHS[imageName] || ''
}

export function getFrameOverlayUrl(partId) {
  if (!partId) return ''
  const imageName = PART_OVERLAY_MAP[partId]
  if (!imageName) {
    console.warn(`⚠️ No frame overlay found for part: ${partId}`)
    return ''
  }
  return OVERLAY_IMAGE_PATHS[imageName] || ''
}

export function getWheelOverlayUrl(partId) {
  if (!partId) return ''
  const imageName = PART_OVERLAY_MAP[partId]
  if (!imageName) {
    console.warn(`⚠️ No wheel overlay found for part: ${partId}`)
    return ''
  }
  const url = OVERLAY_IMAGE_PATHS[imageName]
  if (!url) {
    console.warn(`⚠️ No image path found for: ${imageName}`)
    return ''
  }
  return url
}