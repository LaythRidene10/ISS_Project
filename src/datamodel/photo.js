import { mockPhotos } from './mockdata'

export class Photo {
  constructor ({ id, content }) {
    this.id = id
    this.content = content // PNG data / URL
  }
}

const STORAGE_KEY = 'kartbuilder_photos'

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockPhotos))
  return [...mockPhotos]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAllPhotos () {
  return loadData()
}

export function addPhoto (photo) {
  const list = loadData()
  list.push(photo)
  saveData(list)
}

export function getPhotoById (id) {
  return loadData().find(photo => photo.id === id)
}

export function updatePhotoById (id, updatedData) {
  const list = loadData()
  const photo = list.find(photo => photo.id === id)
  if (photo) {
    Object.assign(photo, updatedData)
    saveData(list)
    return true
  }
  return false
}

export function deletePhotoById (id) {
  const list = loadData()
  const index = list.findIndex(photo => photo.id === id)
  if (index !== -1) {
    list.splice(index, 1)
    saveData(list)
    return true
  }
  return false
}
