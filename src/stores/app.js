// Utilities
import { defineStore } from 'pinia'

const USER_STORAGE_KEY = 'kartbuilder_current_user'
const USER_STORAGE_MODE_KEY = 'kartbuilder_current_user_mode'

function getUserStorage (mode) {
  return mode === 'local' ? localStorage : sessionStorage
}

function loadStoredUser () {
  const mode = localStorage.getItem(USER_STORAGE_MODE_KEY) || sessionStorage.getItem(USER_STORAGE_MODE_KEY)
  if (!mode) return null

  const storage = getUserStorage(mode)
  const rawUser = storage.getItem(USER_STORAGE_KEY)
  return rawUser ? JSON.parse(rawUser) : null
}

export const useAppStore = defineStore('app', {
  state: () => ({
    cart: [],
    currentUser: loadStoredUser(),
  }),

  getters: {
    cartTotal: state =>
      state.cart.reduce((sum, item) => sum + (item.price || 0), 0),

    cartCount: state => state.cart.length,

    isLoggedIn: state => state.currentUser !== null,

    isAdmin: state => state.currentUser?.type === 'admin',

    isSupplier: state => state.currentUser?.type === 'supplier',
  },

  actions: {
    addToCart (item) {
      const existing = this.cart.find(i => i.id === item.id)
      if (!existing) {
        this.cart.push({ ...item, cartId: crypto.randomUUID() })
      }
    },

    removeFromCart (cartId) {
      const index = this.cart.findIndex(i => i.cartId === cartId)
      if (index !== -1) {
        this.cart.splice(index, 1)
      }
    },

    clearCart () {
      this.cart = []
    },

    login (user, rememberMe = false) {
      this.currentUser = user
      const mode = rememberMe ? 'local' : 'session'
      const storage = getUserStorage(mode)
      const otherStorage = getUserStorage(mode === 'local' ? 'session' : 'local')

      otherStorage.removeItem(USER_STORAGE_KEY)
      otherStorage.removeItem(USER_STORAGE_MODE_KEY)
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      storage.setItem(USER_STORAGE_MODE_KEY, mode)
    },

    updateCurrentUser (updates) {
      if (!this.currentUser) return

      this.currentUser = {
        ...this.currentUser,
        ...updates,
      }

      const mode = localStorage.getItem(USER_STORAGE_MODE_KEY) || sessionStorage.getItem(USER_STORAGE_MODE_KEY)
      if (!mode) return

      const storage = getUserStorage(mode)
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(this.currentUser))
      storage.setItem(USER_STORAGE_MODE_KEY, mode)
    },

    logout () {
      this.currentUser = null
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_MODE_KEY)
      sessionStorage.removeItem(USER_STORAGE_KEY)
      sessionStorage.removeItem(USER_STORAGE_MODE_KEY)
    },
  },
})
