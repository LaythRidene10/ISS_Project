import { mockCommentSuppliers } from './mockdata'

export class CommentSupplier {
  constructor ({ comment_id, user_name, text, rating }) {
    this.comment_id = comment_id
    this.user_name = user_name
    this.text = text
    this.rating = rating // 1 - 5
  }
}

const STORAGE_KEY = 'kartbuilder_comment_suppliers'

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockCommentSuppliers))
  return [...mockCommentSuppliers]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getAllCommentSuppliers () {
  return loadData()
}

export function addCommentSupplier (comment) {
  const list = loadData()
  list.push(comment)
  saveData(list)
}

export function getCommentSupplierById (comment_id) {
  return loadData().find(comment => comment.comment_id === comment_id)
}

export function getCommentSuppliersByUserName (user_name) {
  return loadData().filter(comment => comment.user_name === user_name)
}

export function getCommentSuppliersByRating (rating) {
  return loadData().filter(comment => comment.rating === rating)
}

export function updateCommentSupplierById (comment_id, updatedData) {
  const list = loadData()
  const comment = list.find(comment => comment.comment_id === comment_id)
  if (comment) {
    Object.assign(comment, updatedData)
    saveData(list)
    return true
  }
  return false
}

export function deleteCommentSupplierById (comment_id) {
  const list = loadData()
  const index = list.findIndex(comment => comment.comment_id === comment_id)
  if (index !== -1) {
    list.splice(index, 1)
    saveData(list)
    return true
  }
  return false
}
