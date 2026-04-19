<template>
  <v-app-bar flat>
    <template #prepend>
      <v-app-bar-nav-icon v-if="$vuetify.display.smAndDown" @click="drawer = !drawer" />
    </template>

    <v-img
      alt="Kart Hub"
      class="me-sm-8"
      contain
      max-width="40"
      src="/logo-transparent.png"
      style="cursor: pointer"
      @click="$router.push('/')"
    />

    <template v-if="$vuetify.display.mdAndUp">
      <v-btn
        v-for="(item, i) in navItems"
        :key="i"
        :active="route.path === item.to"
        class="me-2 text-none nav-link"
        :class="{ 'nav-link--active': route.path === item.to }"
        slim
        v-bind="item"
      />
    </template>

    <v-spacer />

    <template #append>
      <ThemeToggle />
      <v-btn icon to="/cart">
        <v-badge color="primary" :content="store.cartCount" :model-value="store.cartCount > 0">
          <v-icon>mdi-cart-outline</v-icon>
        </v-badge>
      </v-btn>
      <v-btn class="ms-1 nav-icon-btn" icon>
        <v-icon>mdi-account-circle</v-icon>
        <v-menu activator="parent" location="bottom end" origin="top">
          <v-list class="nav-account-menu" min-width="220">
            <v-list-item v-if="store.isLoggedIn" class="nav-menu-item" link title="My Profile" to="/profile" />
            <v-list-item v-if="store.isLoggedIn" class="nav-menu-item" link title="My Designs" to="/my-designs" />
            <v-list-item
              v-if="store.isAdmin"
              class="nav-menu-item"
              color="primary"
              link
              prepend-icon="mdi-shield-crown-outline"
              title="Admin Panel"
              to="/admin"
            />
            <v-list-item
              v-if="store.isSupplier"
              class="nav-menu-item"
              color="primary"
              link
              prepend-icon="mdi-storefront-outline"
              title="Supplier Panel"
              to="/supplier-panel"
            />
            <v-list-item v-if="store.isLoggedIn" class="nav-menu-item" link title="Sign out" @click="store.logout()" />
            <v-list-item v-else class="nav-menu-item" link title="Sign In" to="/login" />
          </v-list>
        </v-menu>
      </v-btn>
    </template>
  </v-app-bar>

  <v-navigation-drawer v-if="$vuetify.display.smAndDown" v-model="drawer" location="top" temporary>
    <v-list slim>
      <v-list-item v-for="(item, i) in drawerItems" :key="i" link v-bind="item" />
      <v-list-item
        v-if="store.isAdmin"
        color="primary"
        link
        prepend-icon="mdi-shield-crown-outline"
        title="Admin Panel"
        to="/admin"
      />
      <v-list-item
        v-if="store.isSupplier"
        color="primary"
        link
        prepend-icon="mdi-storefront-outline"
        title="Supplier Panel"
        to="/supplier-panel"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAppStore } from '@/stores/app'
  import ThemeToggle from '@/components/ThemeToggle.vue'

  const store = useAppStore()
  const drawer = ref(false)
  const route = useRoute()

  const navItems = [
    { text: 'Home', to: '/' },
    { text: 'Parts', to: '/parts' },
    { text: 'Categories', to: '/categories' },
    { text: 'Posts', to: '/posts' },
    { text: 'Events', to: '/events' },
    { text: 'Builds', to: '/builds' },
    { text: 'About Us', to: '/about' },
  ]

  const drawerItems = [
    { prependIcon: 'mdi-home-outline', title: 'Home', to: '/' },
    { prependIcon: 'mdi-cog-outline', title: 'Parts', to: '/parts' },
    { prependIcon: 'mdi-tag-outline', title: 'Categories', to: '/categories' },
    { prependIcon: 'mdi-file-outline', title: 'Posts', to: '/posts' },
    { prependIcon: 'mdi-calendar-outline', title: 'Events', to: '/events' },
    { prependIcon: 'mdi-tools-outline', title: 'Builds', to: '/builds' },
    { prependIcon: 'mdi-information-outline', title: 'About Us', to: '/about' },
  ]
</script>

<style scoped>
  .nav-link {
    border: 1px solid transparent;
    border-radius: 999px;
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  }

  .nav-link:hover {
    background: rgba(211, 47, 47, 0.08);
    border-color: rgba(211, 47, 47, 0.22);
  }

  .nav-link--active {
    background: linear-gradient(180deg, rgba(211, 47, 47, 0.18) 0%, rgba(211, 47, 47, 0.1) 100%);
    border-color: rgba(211, 47, 47, 0.32);
  }

  .nav-icon-btn:hover {
    background: rgba(211, 47, 47, 0.08);
  }

  .nav-account-menu {
    padding: 8px;
    border-radius: 18px;
  }

  .nav-menu-item {
    border-radius: 12px;
    margin-bottom: 4px;
  }

  .nav-menu-item:last-child {
    margin-bottom: 0;
  }
</style>
