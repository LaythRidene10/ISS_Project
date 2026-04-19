<template>
  <v-btn
    icon
    variant="text"
    size="small"
    @click="toggleTheme"
    class="theme-toggle"
    :title="`Switch to ${store.isDark ? 'Light' : 'Dark'} Mode`"
  >
    <v-icon>
      {{ store.isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}
    </v-icon>
    <v-tooltip activator="parent" location="bottom">
      {{ store.isDark ? 'Light Mode' : 'Dark Mode' }}
    </v-tooltip>
  </v-btn>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const store = useThemeStore()

function toggleTheme() {
  store.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  transition: transform 0.3s ease, color 0.3s ease;
}

.theme-toggle:hover {
  transform: rotate(180deg);
}
</style>
