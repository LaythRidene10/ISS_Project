<template>
  <v-layout>
    <v-main>
      <v-toolbar elevation="1" height="84">
        <template #title>
          <div>
            <h2 class="text-h4 font-weight-bold">Parts</h2>
            <div class="text-body-2 text-medium-emphasis">
              {{ sortedParts.length }} parts available
            </div>
          </div>
        </template>
        <template #append>
          <v-text-field
            v-model="search"
            clearable
            density="comfortable"
            hide-details
            placeholder="Search parts…"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            class="me-4"
            style="width: clamp(260px, 38vw, 640px)"
          />
          <v-select
            v-model="filterType"
            density="comfortable"
            hide-details
            :items="['All', ...PART_TYPES]"
            label="Type"
            variant="outlined"
            style="max-width: 150px"
            class="me-4"
          />
          <v-select
            v-model="sortBy"
            density="comfortable"
            hide-details
            :items="['Name A–Z', 'Name Z–A', 'Price ↑', 'Price ↓']"
            label="Sort"
            variant="outlined"
            style="max-width: 130px"
            class="me-4"
          />
        </template>
      </v-toolbar>

      <div class="pa-4">
        <v-row>
          <v-col
            v-for="part in sortedParts"
            :key="part.ID"
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <v-card class="h-100 part-card" variant="outlined">
              <v-img
                :alt="part.name"
                cover
                height="180"
                :src="part.image"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                    <v-icon color="medium-emphasis" size="28">mdi-image-outline</v-icon>
                  </div>
                </template>
                <div class="part-overlay d-flex justify-space-between align-start pa-2">
                  <v-chip size="small" :color="part.availability ? 'success' : 'error'">
                    {{ part.availability ? 'In Stock' : 'Out of Stock' }}
                  </v-chip>
                  <v-btn
                    :icon="wishlist.includes(part.ID) ? 'mdi-heart' : 'mdi-heart-outline'"
                    :color="wishlist.includes(part.ID) ? 'error' : undefined"
                    size="small"
                    variant="tonal"
                    @click.stop="toggleWishlist(part)"
                  />
                </div>
              </v-img>

              <v-card-title class="text-body-1 font-weight-bold pt-3">
                {{ part.name }}
              </v-card-title>

              <v-card-subtitle class="d-flex align-center gap-1">
                <v-chip size="x-small" variant="tonal">{{ capitalize(part.type) }}</v-chip>
                <v-icon v-if="!part.compatibility" color="warning" size="14">mdi-alert</v-icon>
              </v-card-subtitle>

              <v-card-text class="py-2">
                <!-- Price -->
                <div class="mb-2">
                  <span class="text-h6 font-weight-bold">${{ part.price.toFixed(2) }}</span>
                </div>

                <!-- Rating -->
                <div class="d-flex align-center gap-1 mb-2">
                  <v-rating
                    :model-value="getPartRating(part)"
                    readonly
                    size="x-small"
                    density="compact"
                  />
                  <span class="text-caption text-medium-emphasis">({{ getPartReviews(part) }})</span>
                </div>

                <!-- Stock Level -->
                <div class="mb-2">
                  <div class="text-caption text-medium-emphasis mb-1">Stock</div>
                  <v-progress-linear
                    :model-value="getStockLevel(part)"
                    :color="getStockColor(getStockLevel(part))"
                    height="6"
                    rounded
                  />
                </div>
              </v-card-text>

              <v-card-actions class="d-flex justify-space-between">
                <div class="d-flex gap-1">
                  <v-btn
                    :disabled="!part.availability"
                    icon="mdi-cart-plus"
                    size="small"
                    variant="text"
                    @click.stop="addToCart(part)"
                  />
                  <v-btn
                    icon="mdi-magnify-plus"
                    size="small"
                    variant="text"
                    @click.stop="quickView(part)"
                  />
                </div>
                <div v-if="store.isAdmin" class="d-flex gap-1">
                  <v-btn
                    icon="mdi-pencil-outline"
                    size="small"
                    variant="text"
                    @click.stop="openEdit(part)"
                  />
                  <v-btn
                    color="error"
                    icon="mdi-delete-outline"
                    size="small"
                    variant="text"
                    @click.stop="confirmDelete(part)"
                  />
                </div>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col v-if="sortedParts.length === 0" cols="12">
            <div class="text-center py-12">
              <v-icon class="mb-3 text-medium-emphasis" size="64">mdi-magnify-close</v-icon>
              <div class="text-body-1 text-medium-emphasis">No parts match your filters.</div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-main>
  </v-layout>

  <!-- Quick View Modal -->
  <v-dialog v-model="viewDialog" max-width="700">
    <v-card v-if="selectedPart">
      <v-card-title class="d-flex justify-space-between align-center">
        {{ selectedPart.name }}
        <v-btn icon="mdi-close" variant="text" @click="viewDialog = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" sm="6">
            <v-img
              :alt="selectedPart.name"
              cover
              height="280"
              :src="selectedPart.image"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <div class="mb-4">
              <div class="text-h4 font-weight-bold mb-2">${{ selectedPart.price.toFixed(2) }}</div>
              <v-chip
                :color="selectedPart.availability ? 'success' : 'error'"
                :text-color="'white'"
                size="large"
              >
                {{ selectedPart.availability ? 'In Stock' : 'Out of Stock' }}
              </v-chip>
            </div>

            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-2">RATING</div>
              <div class="d-flex align-center gap-2">
                <v-rating
                  :model-value="getPartRating(selectedPart)"
                  readonly
                  size="small"
                />
                <span class="text-body-2">{{ getPartRating(selectedPart) }}/5 ({{ getPartReviews(selectedPart) }} reviews)</span>
              </div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-2">TYPE</div>
              <v-chip>{{ capitalize(selectedPart.type) }}</v-chip>
            </div>

            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-2">COMPATIBILITY</div>
              <v-icon :color="selectedPart.compatibility ? 'success' : 'warning'" class="me-2">
                {{ selectedPart.compatibility ? 'mdi-check-circle' : 'mdi-alert-circle' }}
              </v-icon>
              <span class="text-body-2">{{ selectedPart.compatibility ? 'Compatible' : 'Check specifications' }}</span>
            </div>

            <v-divider class="my-4" />

            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-2">DESCRIPTION</div>
              <div class="text-body-2">{{ selectedPart.description }}</div>
            </div>

            <v-btn
              :disabled="!selectedPart.availability"
              block
              color="primary"
              prepend-icon="mdi-cart-plus"
              size="large"
              @click="addToCart(selectedPart)"
            >
              Add to Cart
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Edit Dialog -->
  <v-dialog v-model="editDialog" max-width="480">
    <v-card variant="outlined">
      <v-card-title>Edit Part</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editForm.name"
          class="mb-3"
          density="compact"
          label="Name"
          variant="outlined"
        />
        <v-text-field
          v-model.number="editForm.price"
          class="mb-3"
          density="compact"
          label="Price"
          prefix="$"
          type="number"
          variant="outlined"
        />
        <v-select
          v-model="editForm.type"
          class="mb-3"
          density="compact"
          :items="PART_TYPES"
          label="Type"
          variant="outlined"
        />
        <v-textarea
          v-model="editForm.description"
          class="mb-3"
          density="compact"
          label="Description"
          rows="2"
          variant="outlined"
        />
        <v-checkbox v-model="editForm.compatibility" class="mb-1" density="compact" label="Compatible" />
        <v-checkbox v-model="editForm.availability" density="compact" label="In Stock" />
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
        <v-btn variant="outlined" @click="saveEdit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation -->
  <v-dialog v-model="deleteDialog" max-width="340">
    <v-card variant="outlined">
      <v-card-text class="pt-5 px-5">
        Delete <strong>{{ partToDelete?.name }}</strong>?
      </v-card-text>
      <v-card-actions class="justify-space-between px-4 pb-4">
        <v-btn color="error" variant="outlined" @click="doDelete">Yes</v-btn>
        <v-btn variant="outlined" @click="deleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deletePartById, getAllParts, PART_TYPES, updatePartById } from '@/datamodel/part_1'
import { useAppStore } from '@/stores/app'

const parts = computed(() => getAllParts())
const store = useAppStore()
const router = useRouter()

/* Filters */
const filterType = ref('All')
const search = ref('')
const sortBy = ref('Name A–Z')
const wishlist = ref([])
const snackbar = ref(false)
const snackbarText = ref('')

const filteredParts = computed(() => {
  let list = [...parts.value]
  if (filterType.value !== 'All') list = list.filter(p => p.type === filterType.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.type.includes(q))
  }
  return list
})

const sortedParts = computed(() => {
  const list = [...filteredParts.value]
  switch (sortBy.value) {
    case 'Name A–Z':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case 'Name Z–A':
      return list.sort((a, b) => b.name.localeCompare(a.name))
    case 'Price ↑':
      return list.sort((a, b) => a.price - b.price)
    case 'Price ↓':
      return list.sort((a, b) => b.price - a.price)
    default:
      return list
  }
})

/* Quick View */
const viewDialog = ref(false)
const selectedPart = ref(null)

function quickView(part) {
  selectedPart.value = part
  viewDialog.value = true
}

function getPartRating(part) {
  const ratings = {
    ENGINE: 4.8,
    FRAME: 4.5,
    TIRES: 4.9,
    SUSPENSION: 4.6,
    BRAKES: 4.7,
    TRANSMISSION: 4.4,
  }
  return ratings[part.type] || 4.5
}

function getPartReviews(part) {
  const reviews = {
    ENGINE: 234,
    FRAME: 156,
    TIRES: 312,
    SUSPENSION: 189,
    BRAKES: 267,
    TRANSMISSION: 143,
  }
  return reviews[part.type] || 200
}

function getStockLevel(part) {
  return part.availability ? Math.random() * (100 - 30) + 30 : Math.random() * 20
}

function getStockColor(level) {
  if (level > 50) return 'success'
  if (level > 20) return 'warning'
  return 'error'
}

/* Cart */
function addToCart(part) {
  store.addToCart({
    id: part.ID,
    name: part.name,
    price: part.price,
    type: part.type,
    compatibility: part.compatibility,
  })
  snackbarText.value = `${part.name} added to cart!`
  snackbar.value = true
}

function toggleWishlist(part) {
  const idx = wishlist.value.indexOf(part.ID)
  if (idx === -1) {
    wishlist.value.push(part.ID)
    snackbarText.value = 'Added to wishlist!'
  } else {
    wishlist.value.splice(idx, 1)
    snackbarText.value = 'Removed from wishlist.'
  }
  snackbar.value = true
}

/* Edit */
const editDialog = ref(false)
const editForm = ref({})
let editTarget = null

function openEdit(part) {
  editTarget = part
  editForm.value = { ...part }
  editDialog.value = true
}

function saveEdit() {
  if (editTarget) updatePartById(editTarget.ID, editForm.value)
  editDialog.value = false
  snackbarText.value = 'Part updated!'
  snackbar.value = true
}

/* Delete */
const deleteDialog = ref(false)
const partToDelete = ref(null)

function confirmDelete(part) {
  partToDelete.value = part
  deleteDialog.value = true
}

function doDelete() {
  if (partToDelete.value) deletePartById(partToDelete.value.ID)
  deleteDialog.value = false
  snackbarText.value = 'Part deleted!'
  snackbar.value = true
}

/* Util */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}
</script>

<style scoped>
.part-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.part-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.part-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}
</style>
