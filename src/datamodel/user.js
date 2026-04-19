// datamodel/user.js

import { mockUsers } from './mockdata'

export class User {
  constructor ({
    first_name,
    last_name,
    email,
    password,
    type = 'user', // 'admin' | 'supplier' | 'user'
    xpBadge = 'Beginner', // 'Beginner' | 'Intermediate' | 'Expert'
    xpPoints = 0,
  }) {
    this.first_name = first_name
    this.last_name = last_name
    this.email = email
    this.password = password
    this.type = type
    this.xpBadge = xpBadge
    this.xpPoints = xpPoints
  }
}

const STORAGE_KEY = 'kartbuilder_users'

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers))
  return [...mockUsers]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ===================== CREATE ===================== */
export function addUser (u) {
  const list = loadData()
  const user = new User(u)
  list.push(user)
  saveData(list)
  return user
}

/* ===================== READ ===================== */
export function getAllUsers () {
  return loadData()
}

export function getUserByEmail (email) {
  return loadData().find(u => u.email === email) || null
}

export function getUserByEmailAndPassword (email, password) {
  return loadData().find(u =>
    u.email === email && u.password === password,
  ) || null
}

/* ===================== UPDATE ===================== */
export function updateUserByEmail (email, updatedData) {
  const list = loadData()
  const u = list.find(u => u.email === email)
  if (!u) {
    return null
  }
  Object.assign(u, updatedData)
  saveData(list)
  return u
}

/* ===================== DELETE ===================== */
export function deleteUserByEmail (email) {
  const list = loadData()
  const index = list.findIndex(u => u.email === email)
  if (index === -1) {
    return null
  }
  const deleted = list[index]
  list.splice(index, 1)
  saveData(list)
  return deleted
}
