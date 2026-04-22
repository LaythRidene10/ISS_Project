// datamodel/order.js
import { mockOrders } from './mockdata'

export class Order {
  constructor ({
    buildID,
    userName,
    price = 0,
    buildTool,
    status = 'pending', // 'pending' | 'complete'
    delivery = 'air', // 'air' | 'sea' | 'car'
    payment = 'gpay',
    address = {},
    items = [],
  }) {
    this.orderID = crypto.randomUUID()
    this.buildID = buildID
    this.userName = userName
    this.price = price
    this.buildTool = buildTool
    this.status = status
    this.delivery = delivery
    this.payment = payment
    this.address = address // { country, region, address, city, state, zip, phone }
    this.items = items // cart snapshot
    this.createdAt = new Date().toISOString()
  }
}

const STORAGE_KEY = 'kartbuilder_orders'

function loadData () {
  const data = sessionStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders))
  return [...mockOrders]
}

function saveData (data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/* ===================== CREATE ===================== */
export function addOrder (order) {
  const list = loadData()
  list.push(order)
  saveData(list)
  return order
}

/* ===================== READ ===================== */
export function getAllOrders () {
  return loadData()
}

export function getOrderById (orderID) {
  return loadData().find(o => o.orderID === orderID) || null
}

export function getOrdersByUser (userName) {
  return loadData().filter(o => o.userName === userName)
}

/* ===================== UPDATE ===================== */
export function updateOrderStatus (orderID, status) {
  const list = loadData()
  const order = list.find(o => o.orderID === orderID)
  if (!order) {
    return null
  }
  order.status = status
  saveData(list)
  return order
}

export function updateOrderById (orderID, updatedData) {
  const list = loadData()
  const order = list.find(o => o.orderID === orderID)
  if (!order) {
    return null
  }
  Object.assign(order, updatedData)
  saveData(list)
  return order
}

/* ===================== DELETE ===================== */
export function deleteOrderById (orderID) {
  const list = loadData()
  const index = list.findIndex(o => o.orderID === orderID)
  if (index === -1) {
    return null
  }
  const deleted = list[index]
  list.splice(index, 1)
  saveData(list)
  return deleted
}
