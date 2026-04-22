// stores/theme.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const THEME_STORAGE_KEY = 'kartbuilder_theme'

export const useThemeStore = defineStore('theme', () => {
  // 'dark' or 'light'
  const isDark = ref(true)

  // Initialize theme from localStorage or system preference
  function initializeTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    
    if (stored) {
      // Use stored preference
      isDark.value = stored === 'dark'
    } else {
      // Use system preference or default to dark
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark !== false
    }
    
    applyTheme()
  }

  // Apply theme to document
  function applyTheme() {
    const htmlElement = document.documentElement
    
    if (isDark.value) {
      htmlElement.setAttribute('data-theme', 'dark')
      htmlElement.classList.add('dark-mode')
      htmlElement.classList.remove('light-mode')
    } else {
      htmlElement.setAttribute('data-theme', 'light')
      htmlElement.classList.add('light-mode')
      htmlElement.classList.remove('dark-mode')
    }
  }

  // Toggle between light and dark
  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
  }

  // Set specific theme
  function setTheme(theme) {
    isDark.value = theme === 'dark'
    applyTheme()
  }

  // Watch for changes and persist to localStorage
  watch(isDark, (newValue) => {
    localStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light')
  })

  return {
    isDark,
    initializeTheme,
    toggleTheme,
    setTheme,
    applyTheme,
  }
})
