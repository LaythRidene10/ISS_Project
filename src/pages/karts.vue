<template>
  <div>
    <v-toolbar elevation="1" height="84">
      <template #title>
        <h2 class="text-h4 font-weight-bold">Karts</h2>
      </template>
      <template #append>
        <v-select
          v-model="filterCategory"
          class="me-4"
          density="compact"
          hide-details
          :items="['All', 'Junior', 'Senior', 'Pro']"
          style="max-width: 140px"
          variant="outlined"
        />
      </template>
    </v-toolbar>

    <div class="pa-4">
      <v-row>
        <v-col
          v-for="kart in filteredKarts"
          :key="kart.id"
          cols="12"
          md="4"
          sm="6"
        >
          <v-card variant="outlined">
            <v-sheet border="dashed md" height="140" rounded="0" width="100%" />
            <v-card-title>{{ kart.name }}</v-card-title>
            <v-card-subtitle>Engine: {{ kart.engine }} | Category: {{ kart.category }}</v-card-subtitle>
            <v-card-text>
              <span class="text-h6 font-weight-bold">${{ kart.price.toFixed(2) }}</span>
            </v-card-text>
            <v-card-actions class="d-flex flex-wrap gap-1">
              <v-btn
                :color="wishlist.includes(kart.id) ? 'error' : undefined"
                prepend-icon="mdi-heart-outline"
                size="small"
                variant="outlined"
                @click="toggleWishlist(kart)"
              >
                {{ wishlist.includes(kart.id) ? 'Wishlisted' : 'Wishlist' }}
              </v-btn>
              <v-btn prepend-icon="mdi-cart-outline" size="small" variant="outlined" @click="addKartToCart(kart)">
                Add to Cart
              </v-btn>
              <v-btn prepend-icon="mdi-pencil-outline" size="small" to="/builder" variant="text">
                Customize
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
  import { computed, ref, shallowRef } from 'vue'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const drawer = shallowRef(false)

  const filterCategory = ref('All')
  const wishlist = ref([])
  const snackbar = ref(false)
  const snackbarText = ref('')

  const navItems = [
    { text: 'Home', to: '/' },
    { text: 'Posts', to: '/posts' },
    { text: 'Categories', to: '/categories' },
    { text: 'My Designs', to: '/my-designs' },
    { text: 'About Us', to: '/about' },
  ]

  const karts = [
    { id: 1, name: 'Kart Name 1', engine: '125cc', category: 'Junior', price: 1499.99 },
    { id: 2, name: 'Kart Name 2', engine: '250cc', category: 'Senior', price: 2499.99 },
    { id: 3, name: 'Kart Name 3', engine: '125cc', category: 'Junior', price: 1699.99 },
    { id: 4, name: 'Kart Name 4', engine: '400cc', category: 'Pro', price: 4999.99 },
    { id: 5, name: 'Kart Name 5', engine: '250cc', category: 'Senior', price: 2899.99 },
    { id: 6, name: 'Kart Name 6', engine: '125cc', category: 'Junior', price: 1599.99 },
  ]

  const filteredKarts = computed(() => {
    if (filterCategory.value === 'All') return karts
    return karts.filter(k => k.category === filterCategory.value)
  })

  function addKartToCart (kart) {
    store.addToCart({ id: kart.id, name: kart.name, price: kart.price, category: kart.category })
    snackbarText.value = `${kart.name} added to cart!`
    snackbar.value = true
  }

  function toggleWishlist (kart) {
    const idx = wishlist.value.indexOf(kart.id)
    if (idx === -1) {
      wishlist.value.push(kart.id)
      snackbarText.value = 'Added to wishlist!'
    } else {
      wishlist.value.splice(idx, 1)
      snackbarText.value = 'Removed from wishlist.'
    }
    snackbar.value = true
  }
</script>
