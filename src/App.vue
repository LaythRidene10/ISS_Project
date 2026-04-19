<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// Initialize theme on app load
onMounted(() => {
  themeStore.initializeTheme()
})
</script>
