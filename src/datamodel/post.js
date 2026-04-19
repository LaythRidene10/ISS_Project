import { mockPosts } from './mockdata'

export class Post {
  constructor ({ build_id, user_name, likes, description, image = '', comments = [], shares = 0, id = null }) {
    this.id = id || crypto.randomUUID() // Unique post identifier
    this.build_id = build_id
    this.user_name = user_name
    this.likes = likes ?? 0
    this.description = description
    this.image = image
    this.comments = comments
    this.shares = shares
  }
}

const STORAGE_KEY = 'kartbuilder_posts' // Use sessionStorage
const VERSION_KEY = 'kartbuilder_posts_version'
const CURRENT_VERSION = '1.1' // Version bump to force reload
const INTERACTION_STORAGE_KEY = 'kartbuilder_post_interactions'

function loadData () {
  const storedVersion = sessionStorage.getItem(VERSION_KEY)
  
  // If version mismatch, clear old data and reload
  if (storedVersion !== CURRENT_VERSION) {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(INTERACTION_STORAGE_KEY)
    sessionStorage.setItem(VERSION_KEY, CURRENT_VERSION)
  }
  
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockPosts))
  return [...mockPosts]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadInteractions () {
  const data = sessionStorage.getItem(INTERACTION_STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }

  const initialInteractions = { likes: {}, shares: {} }
  sessionStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(initialInteractions))
  return initialInteractions
}

function saveInteractions (interactions) {
  sessionStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(interactions))
}

export function getAllPosts () {
  return loadData()
}

export function addPost (post) {
  const list = loadData()
  list.push(post)
  saveData(list)
}

export function getPostByBuildId (build_id) {
  return loadData().find(post => post.build_id === build_id)
}

export function getPostById (id) {
  return loadData().find(post => post.id === id)
}

export function getPostsByUserName (user_name) {
  return loadData().filter(post => post.user_name === user_name)
}

export function updatePostByBuildId (build_id, updatedData) {
  const list = loadData()
  const post = list.find(post => post.build_id === build_id)
  if (post) {
    Object.assign(post, updatedData)
    saveData(list)
    return true
  }
  return false
}

export function hasUserLikedPost (userName, build_id) {
  if (!userName) return false
  const interactions = loadInteractions()
  return (interactions.likes[userName] || []).includes(build_id)
}

export function hasUserSharedPost (userName, build_id) {
  if (!userName) return false
  const interactions = loadInteractions()
  return (interactions.shares[userName] || []).includes(build_id)
}

export function likePostOnce (userName, build_id) {
  if (!userName) {
    return { ok: false, reason: 'auth_required' }
  }

  if (hasUserLikedPost(userName, build_id)) {
    return { ok: false, reason: 'already_liked' }
  }

  const list = loadData()
  const post = list.find(item => item.build_id === build_id)
  if (!post) {
    return { ok: false, reason: 'not_found' }
  }

  post.likes = Number(post.likes || 0) + 1
  saveData(list)

  const interactions = loadInteractions()
  interactions.likes[userName] = [...(interactions.likes[userName] || []), build_id]
  saveInteractions(interactions)

  return { ok: true, post }
}

export function sharePostOnce (userName, build_id) {
  if (!userName) {
    return { ok: false, reason: 'auth_required' }
  }

  if (hasUserSharedPost(userName, build_id)) {
    return { ok: false, reason: 'already_shared' }
  }

  const list = loadData()
  const post = list.find(item => item.build_id === build_id)
  if (!post) {
    return { ok: false, reason: 'not_found' }
  }

  post.shares = Number(post.shares || 0) + 1
  saveData(list)

  const interactions = loadInteractions()
  interactions.shares[userName] = [...(interactions.shares[userName] || []), build_id]
  saveInteractions(interactions)

  return { ok: true, post }
}

export function deletePostByBuildId (build_id) {
  const list = loadData()
  const index = list.findIndex(post => post.build_id === build_id)
  if (index !== -1) {
    list.splice(index, 1)
    saveData(list)
    return true
  }
  return false
}
