// datamodel/design.js
import { mockDesigns } from './mockdata'

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
  }) {
    this.buildID = buildID ?? crypto.randomUUID()
    this.buildName = buildName ?? 'Untitled Kart'
    this.type = type
    this.parts = parts // array of part IDs or { type: partID } map
    this.userID = userID // email of the owning user
    this.price = price
    this.createdAt = new Date().toISOString()
  }
}

const STORAGE_KEY = 'kartbuilder_designs'

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockDesigns))
  return [...mockDesigns]
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
