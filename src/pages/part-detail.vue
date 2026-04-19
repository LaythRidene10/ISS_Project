<template>
  <div>
    <!-- Not Found -->
    <div v-if="!part" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon class="mb-4 text-medium-emphasis" size="72">mdi-alert-circle-outline</v-icon>
        <div class="text-h6 mb-2">Part not found</div>
        <v-btn to="/parts" variant="outlined">Back to Parts</v-btn>
      </div>
    </div>

    <template v-else>
      <v-toolbar elevation="1" height="84">
        <template #title>
          <h2 class="text-h4 font-weight-bold">{{ part.name }}</h2>
        </template>
      </v-toolbar>

      <div class="pa-4">
        <v-row>
          <!-- Left: Image -->
          <v-col cols="12" md="5">
            <v-card class="mb-4" variant="outlined">
              <v-img
                :alt="part.name"
                cover
                height="280"
                :src="part.image"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                    <v-icon color="medium-emphasis" size="40">mdi-image-outline</v-icon>
                  </div>
                </template>
              </v-img>
            </v-card>

            <!-- Supplier Info -->
            <v-card variant="outlined">
              <v-card-text class="d-flex align-center gap-3">
                <v-avatar color="surface-variant" size="44">
                  <v-icon>mdi-store-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-1 font-weight-bold">
                    {{ supplierName }}
                  </div>
                  <div class="d-flex align-center gap-1">
                    <v-icon
                      :color="supplierCertified ? 'success' : 'warning'"
                      size="14"
                    >
                      {{ supplierCertified ? 'mdi-check-decagram' : 'mdi-alert-decagram-outline' }}
                    </v-icon>
                    <span class="text-caption text-medium-emphasis">
                      {{ supplierCertified ? 'Verified Supplier' : 'Not Verified' }}
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right: Details -->
          <v-col cols="12" md="7">
            <v-card class="mb-4" variant="outlined">
              <v-card-text>
                <!-- Type Chip -->
                <v-chip class="mb-3" color="primary" size="small" variant="tonal">
                  {{ capitalize(part.type) }}
                </v-chip>

                <!-- Name & Serial -->
                <div class="text-h6 font-weight-bold mb-1">{{ part.name }}</div>
                <div class="text-caption text-medium-emphasis mb-3">
                  Serial: {{ part.serialNumber }}
                </div>

                <!-- Price -->
                <div class="text-h4 font-weight-bold mb-3">
                  ${{ part.price.toFixed(2) }}
                </div>

                <!-- Description -->
                <div class="text-body-2 mb-4">{{ part.description }}</div>

                <!-- Availability -->
                <div class="d-flex align-center gap-2 mb-4">
                  <v-icon
                    :color="part.availability ? 'success' : 'error'"
                    size="18"
                  >
                    {{ part.availability ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}
                  </v-icon>
                  <span class="text-body-2">
                    {{ part.availability ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </div>

                <!-- Compatibility -->
                <v-alert
                  v-if="!part.compatibility"
                  class="mb-4"
                  density="compact"
                  type="warning"
                  variant="tonal"
                >
                  This part may not be compatible. Try to correct it before adding to cart.
                </v-alert>

                <!-- Quantity -->
                <div class="d-flex align-center gap-2 mb-5">
                  <span class="text-body-2 font-weight-medium">Qty:</span>
                  <v-btn
                    :disabled="qty <= 1"
                    icon="mdi-minus"
                    size="small"
                    variant="outlined"
                    @click="qty--"
                  />
                  <span class="text-body-1 font-weight-bold px-2">{{ qty }}</span>
                  <v-btn
                    icon="mdi-plus"
                    size="small"
                    variant="outlined"
                    @click="qty++"
                  />
                </div>

                <!-- Actions -->
                <div class="d-flex gap-3 flex-wrap">
                  <v-btn
                    class="text-none flex-grow-1"
                    :disabled="!part.availability"
                    prepend-icon="mdi-cart-plus"
                    size="large"
                    variant="outlined"
                    @click="addToCart"
                  >
                    Add to Cart
                  </v-btn>
                  <v-btn
                    :color="wishlisted ? 'error' : undefined"
                    :icon="wishlisted ? 'mdi-heart' : 'mdi-heart-outline'"
                    size="large"
                    variant="outlined"
                    @click="wishlisted = !wishlisted"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Similar Products -->
        <div class="text-h6 font-weight-bold mb-3">Similar Products</div>
        <v-row>
          <v-col
            v-for="similar in similarParts"
            :key="similar.ID"
            cols="12"
            md="4"
            sm="6"
          >
            <v-card
              link
              :to="`/part-detail?id=${similar.ID}`"
              variant="outlined"
            >
              <v-img
                :alt="similar.name"
                cover
                height="100"
                :src="similar.image"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                    <v-icon color="medium-emphasis" size="24">mdi-image-outline</v-icon>
                  </div>
                </template>
              </v-img>
              <v-card-title class="text-body-1">{{ similar.name }}</v-card-title>
              <v-card-subtitle>${{ similar.price.toFixed(2) }}</v-card-subtitle>
              <v-card-actions>
                <v-btn
                  prepend-icon="mdi-cart-plus"
                  size="small"
                  variant="text"
                  @click.prevent="store.addToCart({ id: similar.ID, name: similar.name, price: similar.price, type: similar.type })"
                >
                  Add
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </template>
  </div>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { useAppStore } from '@/stores/app'
  import { getPartById, getAllParts } from '@/datamodel/part_1'
  import { getSupplierById } from '@/datamodel/supplier'

  const store = useAppStore()
  const route = useRoute()

  const partId = computed(() => route.query.id)
  const part   = computed(() => partId.value ? getPartById(partId.value) : null)

  const supplier = computed(() =>
  part.value?.supplier ? getSupplierById(part.value.supplier) : null
  )
  const supplierName      = computed(() => supplier.value?.name      || 'Unknown Supplier')
  const supplierCertified = computed(() => supplier.value?.certified ?? false)

  const similarParts = computed(() => {
  if (!part.value) return []
  return getAllParts()
  .filter(p => p.type === part.value.type && p.ID !== part.value.ID)
  .slice(0, 3)
  })

  const qty       = ref(1)
  const wishlisted = ref(false)
  const snackbar   = ref(false)
  const snackbarText = ref('')

  function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  }

  function addToCart() {
  if (!part.value) return
  for (let i = 0; i < qty.value; i++) {
  store.addToCart({
  id: part.value.ID + '-' + i,
  name: part.value.name,
  price: part.value.price,
  type: part.value.type,
  compatibility: part.value.compatibility,
  })
  }
  snackbarText.value = `${qty.value}× ${part.value.name} added to cart!`
  snackbar.value = true
  }
</script>
