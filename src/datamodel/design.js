// datamodel/design.js
import { mockDesigns } from './mockdata'
import { PART_TYPES } from './part_1'

export const DESIGN_TYPES = [
  'Cross Kart',
  'Street Kart',
  'Race Kart',
  'Junior Kart',
  'Pro Kart',
  'Daily Kart',
]

export class Design {
  constructor ({
    buildID,
    buildName,
    type,
    parts = [],
    userID = null,
    price = 0,
    color = null,
    previewImage = null,
    isShared = false,
    createdAt,
  }) {
    this.buildID = buildID ?? crypto.randomUUID()
    this.buildName = buildName ?? 'Untitled Kart'
    this.type = type
    this.parts = parts // array of part IDs or { type: partID } map
    this.userID = userID // email of the owning user
    this.price = price
    this.color = color
    this.previewImage = previewImage
    this.isShared = isShared
    this.createdAt = createdAt ?? new Date().toISOString()
  }
}

const STORAGE_KEY = 'kartbuilder_designs'
const STORAGE_VERSION_KEY = 'kartbuilder_designs_version'
const CURRENT_VERSION = '2.0'
const mockDesignIds = new Set(mockDesigns.map(design => design.buildID))
const LEGACY_DEFAULT_DESIGN_IDS = new Set(['build-1', 'build-2', 'build-3'])

export function normalizeDesignParts (parts = []) {
  if (!Array.isArray(parts)) {
    return parts || {}
  }

  return Object.fromEntries(
    PART_TYPES.map((type, index) => [type, parts[index] || null]),
  )
}

function loadData () {
  const storedVersion = sessionStorage.getItem(STORAGE_VERSION_KEY)
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    const normalizedDesigns = JSON.parse(data)
      .filter(design => !LEGACY_DEFAULT_DESIGN_IDS.has(design.buildID))
      .map(design => ({
      ...design,
      parts: normalizeDesignParts(design.parts),
      previewImage: design.previewImage ?? design.thumbnail ?? null,
      isShared: design.isShared ?? mockDesignIds.has(design.buildID),
    }))

    if (storedVersion !== CURRENT_VERSION) {
      sessionStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
      saveData(normalizedDesigns)
    }

    return normalizedDesigns
  }
  const initialDesigns = mockDesigns.map(design => ({
    ...design,
    parts: normalizeDesignParts(design.parts),
    previewImage: design.previewImage ?? design.thumbnail ?? null,
    isShared: design.isShared ?? true,
  }))
  sessionStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialDesigns))
  return [...initialDesigns]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ===================== CREATE ===================== */
export function addDesign (design) {
  const list = loadData()
  list.push(design)
  saveData(list)
  return design
}

/* ===================== READ ===================== */
export function getAllDesigns () {
  return loadData()
}

export function getSharedDesigns () {
  return loadData().filter(d => d.isShared)
}

export function getDesignById (buildID) {
  return loadData().find(d => d.buildID === buildID) || null
}

export function getDesignsByType (type) {
  return loadData().filter(d => d.type === type)
}

export function getDesignsByUser (userID) {
  return loadData().filter(d => d.userID === userID)
}

/* ===================== UPDATE ===================== */
export function updateDesignById (buildID, updatedData) {
  const list = loadData()
  const design = list.find(d => d.buildID === buildID)
  if (!design) {
    return null
  }
  Object.assign(design, updatedData)
  saveData(list)
  return design
}

/* ===================== DELETE ===================== */
export function deleteDesignById (buildID) {
  const list = loadData()
  const index = list.findIndex(d => d.buildID === buildID)
  if (index === -1) {
    return null
  }
  const deleted = list[index]
  list.splice(index, 1)
  saveData(list)
  return deleted
}
