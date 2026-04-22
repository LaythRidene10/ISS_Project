import { mockCommentPosts } from './mockdata'

export class CommentPost {
  constructor ({ id, user_name, text, rating }) {
    this.id = id
    this.user_name = user_name
    this.text = text
    this.rating = rating // 1 to 10
  }
}

const STORAGE_KEY = 'kartbuilder_comment_posts'

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockCommentPosts))
  return [...mockCommentPosts]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAllComments () {
  return loadData()
}

export function addComment (comment) {
  const list = loadData()
  list.push(comment)
  saveData(list)
}

export function getCommentById (id) {
  return loadData().find(comment => comment.id === id)
}

export function getCommentsByUserName (user_name) {
  return loadData().filter(comment => comment.user_name === user_name)
}

export function getCommentsByRating (rating) {
  return loadData().filter(comment => comment.rating === rating)
}

export function updateCommentById (id, updatedData) {
  const list = loadData()
  const comment = list.find(comment => comment.id === id)
  if (comment) {
    Object.assign(comment, updatedData)
    saveData(list)
    return true
  }
  return false
}

export function deleteCommentById (id) {
  const list = loadData()
  const index = list.findIndex(comment => comment.id === id)
  if (index !== -1) {
    list.splice(index, 1)
    saveData(list)
    return true
  }
  return false
}
