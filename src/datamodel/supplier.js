// datamodel/supplier.js
import { mockSuppliers } from './mockdata'

export class Supplier {
  constructor ({
    supplierID,
    name,
    email = '',
    certified = false,
  }) {
    this.supplierID = supplierID ?? crypto.randomUUID()
    this.name = name
    this.email = email
    this.certified = certified
  }
}

const STORAGE_KEY = 'kartbuilder_suppliers'

function normalizeSupplier (supplier) {
  if (supplier?.supplierID === 's-001' && supplier.email === 'contact@kartpartspro.com') {
    return {
      ...supplier,
      email: 'supplier@kartparts.com',
    }
  }

  return supplier
}

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    const normalizedSuppliers = JSON.parse(data).map(normalizeSupplier)
    saveData(normalizedSuppliers)
    return normalizedSuppliers
  }
  const normalizedSuppliers = mockSuppliers.map(normalizeSupplier)
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSuppliers))
  return normalizedSuppliers
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ===================== CREATE ===================== */
export function addSupplier (supplier) {
  const list = loadData()
  list.push(supplier)
  saveData(list)
  return supplier
}

/* ===================== READ ===================== */
export function getAllSuppliers () {
  return loadData()
}

export function getSupplierById (supplierID) {
  return loadData().find(s => s.supplierID === supplierID) || null
}

export function getSupplierByEmail (email) {
  return loadData().find(s => s.email?.toLowerCase() === email?.toLowerCase()) || null
}

export function getSupplierByName (name) {
  return loadData().find(s => s.name === name) || null
}

export function getSuppliersByCertified (certified) {
  return loadData().filter(s => s.certified === certified)
}

/* ===================== UPDATE ===================== */
export function updateSupplierById (supplierID, updatedData) {
  const list = loadData()
  const supplier = list.find(s => s.supplierID === supplierID)
  if (!supplier) {
    return null
  }
  Object.assign(supplier, updatedData)
  saveData(list)
  return supplier
}

/* ===================== DELETE ===================== */
export function deleteSupplierById (supplierID) {
  const list = loadData()
  const index = list.findIndex(s => s.supplierID === supplierID)
  if (index === -1) {
    return null
  }
  const deleted = list[index]
  list.splice(index, 1)
  saveData(list)
  return deleted
}
