// stores/app.js
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    cart: [],
    currentUser: null,
  }),

  getters: {
    cartTotal: state =>
      state.cart.reduce((sum, item) => sum + (item.price || 0), 0),

    cartCount: state => state.cart.length,

    isLoggedIn: state => state.currentUser !== null,

    isAdmin: state => state.currentUser?.type === 'admin',
  },

  actions: {
    /* ---- Cart ---- */
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

    /* ---- Auth ---- */
    login (user) {
      this.currentUser = user
    },

    logout () {
      this.currentUser = null
    },
  },
})
