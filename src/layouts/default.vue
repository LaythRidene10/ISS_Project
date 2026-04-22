<template>
  <v-app theme="kartTheme">
    <NavBar />
    <v-main class="app-main-shell">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup>
  import NavBar from '@/components/NavBar.vue'
</script>

<style scoped>
  .app-main-shell {
    overflow-x: clip;
  }
</style>
