<template>
  <RouterView />
  <KartHubChat />
</template>
<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import KartHubChat from '@/pages/KarthubChat.vue'

const themeStore = useThemeStore()

// Initialize theme on app load
onMounted(() => {
  themeStore.initializeTheme()
})
</script>

