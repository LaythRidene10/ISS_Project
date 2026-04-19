<template>
  <v-app-bar flat>
    <template #prepend>
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
    </template>
    <v-app-bar-title>
      <v-img max-width="120" src="" />
    </v-app-bar-title>
    <v-spacer />
    <template #append>
      <v-chip class="ms-2">{{ store.cartCount }} item(s)</v-chip>
      <v-btn class="ms-1" icon to="/profile">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </template>
  </v-app-bar>

  <div>
    <v-toolbar elevation="1" height="84">
      <template #title>
        <h2 class="text-h4 font-weight-bold">Checkout</h2>
      </template>
    </v-toolbar>

    <div class="pa-4">
      <!-- Empty cart guard -->
      <v-alert
        v-if="store.cart.length === 0"
        class="mb-4"
        type="info"
        variant="tonal"
      >
        Your cart is empty.
        <v-btn size="small" to="/karts" variant="text">Browse Karts</v-btn>
      </v-alert>

      <v-row>
        <!-- Left: Contact + Delivery + Payment -->
        <v-col cols="12" md="7">
          <!-- Contact -->
          <v-card class="mb-4" variant="outlined">
            <v-card-title>Contact</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="form.contact"
                density="compact"
                label="Email or Phone"
                variant="outlined"
              />
            </v-card-text>
          </v-card>

          <!-- Delivery Options -->
          <v-card class="mb-4" variant="outlined">
            <v-card-title>Delivery Option</v-card-title>
            <v-card-text>
              <v-radio-group v-model="form.delivery" class="mb-4" inline>
                <v-radio label="Air" value="air" />
                <v-radio label="Sea" value="sea" />
                <v-radio label="Car" value="car" />
              </v-radio-group>

              <v-text-field
                class="mb-3"
                density="compact"
                label="Estimated Time"
                :model-value="estimatedTime"
                readonly
                variant="outlined"
              />
              <v-text-field
                v-model="form.country"
                class="mb-3"
                density="compact"
                label="Country"
                variant="outlined"
              />
              <v-text-field
                v-model="form.region"
                class="mb-3"
                density="compact"
                label="Region"
                variant="outlined"
              />
              <v-text-field
                v-model="form.address"
                class="mb-3"
                density="compact"
                label="Address"
                variant="outlined"
              />
              <v-text-field
                v-model="form.city"
                class="mb-3"
                density="compact"
                label="City"
                variant="outlined"
              />
              <v-text-field
                v-model="form.state"
                class="mb-3"
                density="compact"
                label="State"
                variant="outlined"
              />
              <v-text-field
                v-model="form.zip"
                class="mb-3"
                density="compact"
                label="ZIP Code"
                variant="outlined"
              />
              <v-text-field v-model="form.phone" density="compact" label="Phone" variant="outlined" />
            </v-card-text>
          </v-card>

          <!-- Payment Methods -->
          <v-card variant="outlined">
            <v-card-title>Payment Methods</v-card-title>
            <v-card-text>
              <v-radio-group v-model="form.payment">
                <v-radio label="Google Pay" value="gpay" />
                <v-radio label="PayPal" value="paypal" />
                <v-radio label="Visa" value="visa" />
              </v-radio-group>
              <v-btn
                block
                class="mt-2"
                :loading="placing"
                size="large"
                variant="outlined"
                @click="placeOrder"
              >
                Buy Now
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right: Order Summary -->
        <v-col cols="12" md="5">
          <v-card class="mb-4" variant="outlined">
            <v-card-title>Order</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="item in store.cart"
                  :key="item.cartId"
                  :subtitle="item.type || ''"
                  :title="item.name"
                >
                  <template #append>
                    <span class="text-body-2">${{ (item.price || 0).toFixed(2) }}</span>
                  </template>
                </v-list-item>
                <v-list-item v-if="store.cart.length === 0" title="No items" />
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Discount + Total -->
          <v-card variant="outlined">
            <v-card-text>
              <div class="d-flex gap-2 mb-3">
                <v-text-field
                  v-model="discountCode"
                  density="compact"
                  hide-details
                  label="Discount Code"
                  variant="outlined"
                />
                <v-btn variant="outlined" @click="applyDiscount">Apply</v-btn>
              </div>
              <v-divider class="mb-3" />
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Subtotal</span>
                <span class="text-body-2">${{ store.cartTotal.toFixed(2) }}</span>
              </div>
              <div v-if="discount > 0" class="d-flex justify-space-between mb-1 text-success">
                <span class="text-body-2">Discount</span>
                <span class="text-body-2">-${{ discount.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-body-1 font-weight-bold">Total</span>
                <span class="text-body-1 font-weight-bold">
                  ${{ finalTotal.toFixed(2) }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>

  <!-- Order Placed Dialog -->
  <v-dialog v-model="successDialog" max-width="400" persistent>
    <v-card variant="outlined">
      <v-card-text class="text-center pa-6">
        <v-icon class="mb-3" color="success" size="64">mdi-check-circle-outline</v-icon>
        <div class="text-h6 font-weight-bold mb-2">Order Placed!</div>
        <div class="text-body-2 text-medium-emphasis mb-2">
          Congratulations on your loyalty!
        </div>
        <div class="text-body-2 mb-4">
          Here's a gift code for 20% off: <strong>KART20</strong>
        </div>
        <v-btn to="/" variant="outlined" @click="successDialog = false">
          Back to Home
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar" timeout="2500">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { addOrder, Order } from '@/datamodel/order'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const router = useRouter()

  const form = ref({
    contact: '',
    delivery: 'air',
    payment: 'gpay',
    country: '',
    region: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  })

  const discountCode = ref('')
  const discount = ref(0)
  const placing = ref(false)
  const successDialog = ref(false)
  const snackbar = ref(false)
  const snackbarText = ref('')

  const estimatedTime = computed(() => {
    const times = { air: '2-3 days', sea: '2-3 weeks', car: '1-2 days' }
    return times[form.value.delivery] || ''
  })

  const finalTotal = computed(() =>
    Math.max(0, store.cartTotal - discount.value),
  )

  function applyDiscount () {
    if (discountCode.value.toUpperCase() === 'KART20') {
      discount.value = store.cartTotal * 0.2
      snackbarText.value = '20% discount applied!'
    } else {
      discount.value = 0
      snackbarText.value = 'Invalid discount code.'
    }
    snackbar.value = true
  }

  function placeOrder () {
    if (store.cart.length === 0) {
      snackbarText.value = 'Your cart is empty.'
      snackbar.value = true
      return
    }
    placing.value = true
    setTimeout(() => {
      const order = new Order({
        userName: store.currentUser?.email || form.value.contact,
        price: finalTotal.value,
        delivery: form.value.delivery,
        payment: form.value.payment,
        address: {
          country: form.value.country,
          region: form.value.region,
          address: form.value.address,
          city: form.value.city,
          state: form.value.state,
          zip: form.value.zip,
          phone: form.value.phone,
        },
        items: [...store.cart],
      })
      addOrder(order)
      store.clearCart()
      placing.value = false
      successDialog.value = true
    }, 800)
  }
</script>
