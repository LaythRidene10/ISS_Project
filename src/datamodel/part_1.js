// datamodel/part_1.js
import { mockParts } from './mockdata'

const PART_IMAGE_URLS = {
  'Predator 212cc Engine.jpg': new URL('../assets/parts/Predator 212cc Engine.jpg', import.meta.url).href,
  'TPP-212EE Engine.jpg': new URL('../assets/parts/TPP-212EE Engine.jpg', import.meta.url).href,
  'X30-Super-Shifter Engine.jpg': new URL('../assets/parts/X30-Super-Shifter Engine.jpg', import.meta.url).href,
  'rotax-125-max-engine.jpg': new URL('../assets/parts/rotax-125-max-engine.jpg', import.meta.url).href,
  'iame-x30-engine.jpg': new URL('../assets/parts/iame-x30-engine.jpg', import.meta.url).href,
  'mg-yellow-slick-tires.jpg': new URL('../assets/parts/mg-yellow-slick-tires.jpg', import.meta.url).href,
  'vega-xh-tires.jpg': new URL('../assets/parts/vega-xh-tires.jpg', import.meta.url).href,
  'Birel ART Brake System.jpg': new URL('../assets/parts/Birel ART Brake System.jpg', import.meta.url).href,
  'CGR V04 Brake Caliper.jpg': new URL('../assets/parts/CGR V04 Brake Caliper.jpg', import.meta.url).href,
  'Wilwood 120-5750 Brake Caliper.jpg': new URL('../assets/parts/Wilwood 120-5750 Brake Caliper.jpg', import.meta.url).href,
  'otk-front-brake-system.jpg': new URL('../assets/parts/otk-front-brake-system.jpg', import.meta.url).href,
  'brembo-rear-caliper.jpg': new URL('../assets/parts/brembo-rear-caliper.jpg', import.meta.url).href,
  'tony-kart-frame-401r.jpg': new URL('../assets/parts/tony-kart-frame-401r.jpg', import.meta.url).href,
  'crg-black-steel-frame.jpg': new URL('../assets/parts/crg-black-steel-frame.jpg', import.meta.url).href,
  'Birel RY30 Frame.webp': new URL('../assets/parts/Birel RY30 Frame.webp', import.meta.url).href,
  'Kosmic Mercuary Kart Frame.jpg': new URL('../assets/parts/Kosmic Mercuary Kart Frame.jpg', import.meta.url).href,
  'Sodi SIGMA-KZ Frame.png': new URL('../assets/parts/Sodi SIGMA-KZ Frame.png', import.meta.url).href,
  'Douglas Magnesium Wheels.png': new URL('../assets/parts/Douglas Magnesium Wheels.png', import.meta.url).href,
  'LeCont Prime Wheels.webp': new URL('../assets/parts/LeCont Prime Wheels.webp', import.meta.url).href,
  'Maxxis-Sport-Wheels.webp': new URL('../assets/parts/Maxxis-Sport-Wheels.webp', import.meta.url).href,
  'AlveyTech Seat.jpg': new URL('../assets/parts/AlveyTech Seat.jpg', import.meta.url).href,
  'Jecko-x-light-standard-seat.jpg': new URL('../assets/parts/Jecko-x-light-standard-seat.jpg', import.meta.url).href,
  'NEK Carbon Seat.jpg': new URL('../assets/parts/NEK Carbon Seat.jpg', import.meta.url).href,
  'tillett-t11-seat.jpg': new URL('../assets/parts/tillett-t11-seat.jpg', import.meta.url).href,
  'omp-ks2-seat.jpg': new URL('../assets/parts/omp-ks2-seat.jpg', import.meta.url).href,
  'Bolt Sterring Wheel.jpg': new URL('../assets/parts/Bolt Sterring Wheel.jpg', import.meta.url).href,
  'otk-steering-wheel.png': new URL('../assets/parts/otk-steering-wheel.png', import.meta.url).href,
  'otk-steering-wheel.jpg': new URL('../assets/parts/otk-steering-wheel.jpg', import.meta.url).href,
  'mychron-column-kit.jpg': new URL('../assets/parts/mychron-column-kit.jpg', import.meta.url).href,
}

// Part types used across the builder, parts list, and admin panel
export const PART_TYPES = ['engine', 'wheel', 'brake', 'frame', 'seat', 'steering']

// Compatibility rules: which parts work together
// Format: { partType: { compatibleWith: { otherPartType: [allowedIDs] } } }
// Themed compatibility system with strategic constraints
export const COMPATIBILITY_RULES = {
  engine: {
    // Rotax 125 MAX (p-001) - High-performance racing
    'p-001': { frame: ['p-007', 'p-024'], brake: ['p-005', 'p-006', 'p-016', 'p-017', 'p-018'] },
    // IAME X30 (p-002) - Balanced racing
    'p-002': { frame: ['p-007', 'p-023', 'p-024'], brake: ['p-005', 'p-016', 'p-017', 'p-018'] },
    // Predator 212cc (p-013) - Budget beginner
    'p-013': { frame: ['p-008', 'p-025'], brake: ['p-005'] },
    // TPP-212EE (p-014) - Mid-range budget
    'p-014': { frame: ['p-008', 'p-024', 'p-025'], brake: ['p-005', 'p-016', 'p-017'] },
    // X30 Super Shifter (p-015) - Premium performance
    'p-015': { frame: ['p-007', 'p-023', 'p-024'], brake: ['p-016', 'p-017', 'p-018'] },
  },
  frame: {
    // Tony Kart 401R (p-007) - Premium all-arounder
    'p-007': { engine: ['p-001', 'p-002', 'p-015'], brake: ['p-005', 'p-006', 'p-016', 'p-017', 'p-018'], wheel: ['p-003', 'p-026', 'p-027'] },
    // CRG Black Steel (p-008) - Durable budget/mid-range
    'p-008': { engine: ['p-013', 'p-014'], brake: ['p-005', 'p-016', 'p-017'], wheel: ['p-004', 'p-028'] },
    // Birel RY30 Frame (p-023) - Modern balanced
    'p-023': { engine: ['p-002', 'p-015'], brake: ['p-016', 'p-017', 'p-018'], wheel: ['p-026', 'p-027'] },
    // Kosmic Mercuary (p-024) - Speed-focused
    'p-024': { engine: ['p-001', 'p-002', 'p-014', 'p-015'], brake: ['p-005', 'p-017', 'p-018'], wheel: ['p-003', 'p-026', 'p-027', 'p-028'] },
    // Sodi SIGMA-KZ (p-025) - Heavy-duty beginner
    'p-025': { engine: ['p-013', 'p-014'], brake: ['p-005'], wheel: ['p-004', 'p-028'] },
  },
  brake: {
    // OTK Front Brake (p-005) - Universal standard
    'p-005': { frame: ['p-007', 'p-008', 'p-024', 'p-025'], engine: ['p-001', 'p-002', 'p-013', 'p-014', 'p-015'] },
    // Brembo Rear Caliper (p-006) - Premium only
    'p-006': { frame: ['p-007'], engine: ['p-001'] },
    // Birel ART Brake System (p-016) - Advanced racing
    'p-016': { frame: ['p-007', 'p-023', 'p-024'], engine: ['p-002', 'p-014', 'p-015'] },
    // CGR V04 Brake Caliper (p-017) - Performance
    'p-017': { frame: ['p-007', 'p-008', 'p-023', 'p-024'], engine: ['p-002', 'p-014', 'p-015'] },
    // Wilwood 120-5750 (p-018) - High-end performance
    'p-018': { frame: ['p-007', 'p-023', 'p-024'], engine: ['p-001', 'p-002', 'p-015'] },
  },
  wheel: {
    // MG Yellow Slick (p-003) - Premium dry
    'p-003': { frame: ['p-007', 'p-024'] },
    // Vega XH (p-004) - All-condition budget
    'p-004': { frame: ['p-008', 'p-025'] },
    // Douglas Magnesium (p-026) - Lightweight premium
    'p-026': { frame: ['p-007', 'p-023', 'p-024'] },
    // LeCont Prime (p-027) - Premium quality
    'p-027': { frame: ['p-007', 'p-023', 'p-024'] },
    // Maxxis Sport (p-028) - Versatile sport
    'p-028': { frame: ['p-008', 'p-024', 'p-025'] },
  },
  seat: {
    // Tillett T11 (p-009) - Racing focused
    'p-009': { frame: ['p-007', 'p-023', 'p-024'] },
    // OMP KS-2 (p-010) - Budget comfort
    'p-010': { frame: ['p-008', 'p-025'] },
    // AlveyTech (p-019) - Comfort recreation
    'p-019': { frame: ['p-008', 'p-025'] },
    // Jecko X-Light (p-020) - Lightweight racing
    'p-020': { frame: ['p-007', 'p-023', 'p-024'] },
    // NEK Carbon (p-021) - Premium racing
    'p-021': { frame: ['p-007', 'p-023', 'p-024'] },
  },
  steering: {
    // OTK Steering Wheel (p-011) - Standard
    'p-011': { frame: ['p-007', 'p-008', 'p-023', 'p-024', 'p-025'] },
    // Mychron Column Kit (p-012) - Premium exclusive
    'p-012': { frame: ['p-007'] },
    // Bolt Steering Wheel (p-022) - Performance
    'p-022': { frame: ['p-023', 'p-024'] },
  },
}

export class Part {
  constructor ({
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
    compatRules = {}, // specific compatibility rules for this part
  }) {
    this.ID = ID ?? crypto.randomUUID()
    this.name = name
    this.type = type // one of PART_TYPES
    this.image = image
    this.price = price
    this.description = description
    this.serialNumber = serialNumber ?? `SN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    this.compatibility = compatibility
    this.availability = availability
    this.supplier = supplier // supplierID reference
    this.compatRules = compatRules // specific compatibility object
  }
}

const STORAGE_KEY = 'kartbuilder_parts'
const STORAGE_VERSION_KEY = 'kartbuilder_parts_version'
const CURRENT_VERSION = '2.1' // Increment when mockParts changes

function resolvePartImage (image) {
  if (!image) {
    return ''
  }

  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('/')) {
    return image
  }

  return PART_IMAGE_URLS[image] ?? image
}

function normalizePart (part) {
  return {
    ...part,
    image: resolvePartImage(part.image),
  }
}

function loadData () {
  const storedVersion = sessionStorage.getItem(STORAGE_VERSION_KEY)
  const data = sessionStorage.getItem(STORAGE_KEY)
  const normalizedParts = mockParts.map(normalizePart)

  // If version mismatch or no data, reload from mockParts
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

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ===================== CREATE ===================== */
export function addPart (part) {
  const list = loadData()
  list.push(part)
  saveData(list)
  return part
}

/* ===================== READ ===================== */
export function getAllParts () {
  return loadData()
}

export function getPartById (ID) {
  return loadData().find(p => p.ID === ID) || null
}

export function getPartsByType (type) {
  return loadData().filter(p => p.type === type)
}

/* ===================== UPDATE ===================== */
export function updatePartById (ID, updatedData) {
  const list = loadData()
  const part = list.find(p => p.ID === ID)
  if (!part) {
    return null
  }
  Object.assign(part, updatedData)
  saveData(list)
  return part
}

/* ===================== DELETE ===================== */
export function deletePartById (ID) {
  const list = loadData()
  const index = list.findIndex(p => p.ID === ID)
  if (index === -1) {
    return null
  }
  const deleted = list[index]
  list.splice(index, 1)
  saveData(list)
  return deleted
}

/* ===================== COMPATIBILITY CHECKING ===================== */
/**
 * Check if two parts are compatible with each other
 * @param {Part} part1 - First part
 * @param {Part} part2 - Second part
 * @returns {{compatible: boolean, reason?: string}}
 */
export function checkCompatibility (part1, part2) {
  if (!part1 || !part2) {
    return { compatible: true }
  } // null parts are fine

  // Check rules for part1 -> part2
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

  // Check rules for part2 -> part1 (bidirectional check)
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

/**
 * Validate a complete parts selection
 * @param {Object} selectedParts - Object with part types as keys and Part IDs as values
 * @returns {{valid: boolean, incompatiblePairs: Array<{parts: string[], reason: string}>}}
 */
export function validatePartsSelection (selectedParts) {
  const incompatiblePairs = []
  const partIds = Object.values(selectedParts).filter(Boolean)

  // Get actual part objects
  const parts = partIds.map(id => getPartById(id)).filter(Boolean)

  // Check all pairs
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

/**
 * Get compatible options for a part type given current selection
 * @param {string} partType - Type of part to filter (e.g., 'engine')
 * @param {Object} selectedParts - Current selection of other parts
 * @returns {Array<Part>} - Array of compatible parts
 */
export function getCompatibleParts (partType, selectedParts = {}) {
  const allParts = getPartsByType(partType)
  const otherParts = Object.entries(selectedParts)
    .filter(([type]) => type !== partType)
    .map(([, id]) => getPartById(id))
    .filter(Boolean)

  // If no other parts selected, all parts are compatible
  if (otherParts.length === 0) {
    return allParts
  }

  return allParts.filter(part => {
    return otherParts.every(other => {
      const result = checkCompatibility(part, other)
      return result.compatible
    })
  })
}
