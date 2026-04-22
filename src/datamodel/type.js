import { mockTypes } from './mockdata'

export class Type {
  constructor ({ name }) {
    this.name = name // "cross kart" | "street kart" | "race kart"
  }
}

const STORAGE_KEY = 'kartbuilder_types'

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockTypes))
  return [...mockTypes]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAllTypes () {
  return loadData()
}

export function addType (type) {
  const list = loadData()
  list.push(type)
  saveData(list)
}

export function getTypeByName (name) {
  return loadData().find(type => type.name === name)
}

export function updateTypeByName (name, updatedData) {
  const list = loadData()
  const type = list.find(type => type.name === name)
  if (type) {
    Object.assign(type, updatedData)
    saveData(list)
    return true
  }
  return false
}

export function deleteTypeByName (name) {
  const list = loadData()
  const index = list.findIndex(type => type.name === name)
  if (index !== -1) {
    list.splice(index, 1)
    saveData(list)
    return true
  }
  return false
}
