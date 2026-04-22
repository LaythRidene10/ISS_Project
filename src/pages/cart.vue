<template>
  <v-app-bar flat>
    <template #prepend>
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
    </template>
    <v-app-bar-title>Shopping Cart</v-app-bar-title>
    <v-spacer />
  
  </v-app-bar>

  <div>
    <v-toolbar elevation="1" height="84">
      <template #title>
        <h2 class="text-h4 font-weight-bold">Cart</h2>
      </template>
    </v-toolbar>

    <div class="pa-4">

      <!-- Empty State -->
      <div v-if="store.cart.length === 0" class="text-center py-16">
        <v-icon class="mb-4 text-medium-emphasis" size="72">mdi-cart-outline</v-icon>
        <div class="text-h6 text-medium-emphasis mb-2">Your cart is empty</div>
        <div class="text-body-2 text-medium-emphasis mb-6">
          Browse karts or parts to add them here.
        </div>
        <v-btn to="/karts" variant="outlined">Browse Karts</v-btn>
        <v-btn class="ms-2" to="/categories" variant="outlined">Browse Categories</v-btn>
      </div>

      <template v-else>
        <v-row>
          <!-- Left: Cart Items -->
          <v-col cols="12" md="8">
            <v-card class="mb-4" variant="outlined">
              <v-card-title class="d-flex align-center justify-space-between">
                Order
                <v-btn
                  color="error"
                  size="small"
                  variant="text"
                  @click="confirmClear = true"
                >
                  Clear all
                </v-btn>
              </v-card-title>
              <v-divider />
              <v-list>
                <v-list-item
                  v-for="item in store.cart"
                  :key="item.cartId"
                  class="py-3"
                >
                  <template #prepend>
                    <v-sheet
                      border="dashed md"
                      class="me-3"
                      height="64"
                      rounded="lg"
                      width="64"
                    />
                  </template>

                  <template #title>
                    <span class="font-weight-medium">{{ item.name }}</span>
                  </template>

                  <template #subtitle>
                    {{ item.type || item.category || '' }}
                  </template>

                  <template #append>
                    <div class="d-flex align-center gap-3">
                      <span class="text-body-1 font-weight-bold">
                        ${{ (item.price || 0).toFixed(2) }}
                      </span>
                      <v-btn
                        icon="mdi-close"
                        size="small"
                        variant="text"
                        @click="store.removeFromCart(item.cartId)"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- Right: Summary -->
          <v-col cols="12" md="4">
            <v-card class="mb-4" variant="outlined">
              <v-card-title>Summary</v-card-title>
              <v-card-text>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Items ({{ store.cartCount }})</span>
                  <span class="text-body-2">${{ store.cartTotal.toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Shipping</span>
                  <span class="text-body-2 text-medium-emphasis">Calculated at checkout</span>
                </div>
                <v-divider class="my-3" />
                <div class="d-flex justify-space-between mb-4">
                  <span class="text-h6 font-weight-bold">Total</span>
                  <span class="text-h6 font-weight-bold">
                    ${{ store.cartTotal.toFixed(2) }}
                  </span>
                </div>
                <v-btn block size="large" to="/checkout" variant="outlined">
                  Proceed to Checkout
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Incompatibility Warning -->
            <v-alert
              v-if="hasIncompatible"
              density="compact"
              type="warning"
              variant="tonal"
            >
              Some parts in your cart may be incompatible. Try to correct it.
            </v-alert>
          </v-col>
        </v-row>
      </template>
    </div>
  </div>

  <!-- Clear Cart Confirmation Dialog -->
  <v-dialog v-model="confirmClear" max-width="340">
    <v-card variant="outlined">
      <v-card-text class="text-body-1 pt-5">
        Are you sure you want to clear your cart?
      </v-card-text>
      <v-card-actions class="justify-space-between px-4 pb-4">
        <v-btn variant="outlined" @click="doClear">Yes</v-btn>
        <v-btn variant="outlined" @click="confirmClear = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const confirmClear = ref(false)

  const hasIncompatible = computed(() =>
    store.cart.some(item => item.compatibility === false),
  )

  function doClear () {
    store.clearCart()
    confirmClear.value = false
  }
</script>
