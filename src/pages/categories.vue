<template>
  <v-layout>
    <v-main>
      <v-toolbar elevation="1" height="84">
        <template #title>
          <div>
            <h2 class="text-h4 font-weight-bold">Categories</h2>
            <div class="text-body-2 text-medium-emphasis">Explore kart parts organized by type.</div>
          </div>
        </template>
        <template #append>
          <v-text-field
            v-model="search"
            clearable
            density="comfortable"
            hide-details
            placeholder="Search categories…"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            class="me-4"
            style="width: clamp(260px, 38vw, 640px)"
          />
          <v-btn
            v-if="store.isAdmin"
            class="text-none"
            prepend-icon="mdi-plus"
            variant="outlined"
            @click="addDialog = true"
          >
            Add Category
          </v-btn>
        </template>
      </v-toolbar>

      <div class="pa-4">
        <v-row>
          <v-col
            v-for="category in filteredCategories"
            :key="category.id"
            cols="12"
            lg="3"
            md="4"
            sm="6"
          >
            <v-card
              class="h-100 category-card"
              variant="outlined"
              @mouseenter="hoveredCategory = category.id"
              @mouseleave="hoveredCategory = null"
            >
              <v-img
                :alt="category.name"
                cover
                height="160"
                :src="category.image"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                    <v-icon color="medium-emphasis" size="32">mdi-image-outline</v-icon>
                  </div>
                </template>
                <div class="category-overlay">
                  <v-chip
                    :color="getCategoryColor(category)"
                    size="small"
                    text-color="white"
                  >
                    {{ getPartCount(category) }} parts
                  </v-chip>
                </div>
              </v-img>

              <v-card-title class="text-h6 pt-4">{{ category.name }}</v-card-title>
              <v-card-subtitle>{{ category.configuration }}</v-card-subtitle>

              <v-card-actions class="justify-space-between">
                <v-btn
                  append-icon="mdi-arrow-right"
                  size="small"
                  variant="outlined"
                  @click="goToCategoryDetail(category)"
                >
                  View Description
                </v-btn>
                <v-btn
                  icon="mdi-magnify-plus-outline"
                  size="small"
                  variant="text"
                  @click.stop="previewCategory(category)"
                />
              </v-card-actions>

              <!-- Admin Actions -->
              <v-divider v-if="store.isAdmin" />
              <v-card-actions v-if="store.isAdmin" class="justify-space-between">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  @click.stop="editCategory(category)"
                />
                <v-btn
                  color="error"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  @click.stop="confirmDelete(category)"
                />
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col v-if="filteredCategories.length === 0" cols="12">
            <div class="text-center py-12">
              <v-icon class="mb-3 text-medium-emphasis" size="64">mdi-folder-open-outline</v-icon>
              <div class="text-body-1 text-medium-emphasis">No categories found.</div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-main>
  </v-layout>

  <!-- Preview Dialog with Parts Grid -->
  <v-dialog v-model="previewDialog" max-width="1000">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h5">{{ selectedCategory?.name }}</div>
          <div class="text-caption text-medium-emphasis">
            {{ getPartCount(selectedCategory) }} parts · Avg: ${{ getAvgPrice(selectedCategory) }}
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="previewDialog = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-6">
        <div v-if="getCategoryParts(selectedCategory).length > 0">
          <v-row>
            <v-col
              v-for="part in getCategoryParts(selectedCategory).slice(0, 12)"
              :key="part.ID"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                variant="outlined"
                class="h-100 part-preview-card"
                @click="viewPart(part)"
              >
                <v-img
                  :alt="part.name"
                  cover
                  height="120"
                  :src="part.image"
                >
                  <div class="part-preview-status">
                    <v-chip
                      :color="part.availability ? 'success' : 'error'"
                      size="x-small"
                      text-color="white"
                    >
                      {{ part.availability ? 'In Stock' : 'Out' }}
                    </v-chip>
                  </div>
                </v-img>
                <v-card-title class="text-body-2 pt-2">{{ part.name }}</v-card-title>
                <v-card-text class="text-h6 font-weight-bold pb-2">
                  ${{ part.price.toFixed(2) }}
                </v-card-text>
                <v-card-actions class="pt-0">
                  <v-btn
                    icon="mdi-cart-plus"
                    size="small"
                    variant="text"
                    :disabled="!part.availability"
                    @click.stop="addToCart(part)"
                  />
                  <v-spacer />
                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    @click.stop="viewPart(part)"
                  />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <div class="text-center mt-6">
            <v-btn
              color="primary"
              append-icon="mdi-arrow-right"
              variant="outlined"
              size="large"
              @click="filterAndNavigateToParts(selectedCategory)"
            >
              View All {{ getPartCount(selectedCategory) }} Parts
            </v-btn>
          </div>
        </div>
        <div v-else class="text-center py-8 text-medium-emphasis">
          No parts in this category yet.
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Add Category Dialog -->
  <v-dialog v-model="addDialog" max-width="500">
    <v-card variant="outlined">
      <v-card-title>Add Category</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="newCategory.name"
          class="mb-3"
          density="compact"
          label="Category Name"
          variant="outlined"
        />
        <v-text-field
          v-model="newCategory.configuration"
          class="mb-3"
          density="compact"
          label="Configuration"
          variant="outlined"
        />
        <v-text-field
          v-model="newCategory.image"
          class="mb-3"
          density="compact"
          label="Image URL"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="addDialog = false">Cancel</v-btn>
        <v-btn variant="outlined" @click="saveCategory">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Edit Category Dialog -->
  <v-dialog v-model="editDialog" max-width="500">
    <v-card variant="outlined">
      <v-card-title>Edit Category</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editingCategory.name"
          class="mb-3"
          density="compact"
          label="Category Name"
          variant="outlined"
        />
        <v-text-field
          v-model="editingCategory.configuration"
          class="mb-3"
          density="compact"
          label="Configuration"
          variant="outlined"
        />
        <v-text-field
          v-model="editingCategory.image"
          class="mb-3"
          density="compact"
          label="Image URL"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
        <v-btn variant="outlined" @click="saveEdit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card variant="outlined">
      <v-card-text class="pt-5">
        Delete <strong>{{ categoryToDelete?.name }}</strong>?
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="error" variant="outlined" @click="deleteCategory">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getAllCategories } from '@/datamodel/categories'
import { getAllParts } from '@/datamodel/part_1'

const store = useAppStore()
const router = useRouter()
const search = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const hoveredCategory = ref(null)

const categories = ref(getAllCategories().map(category => ({ ...category, id: Math.random() })))
const previewDialog = ref(false)
const addDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const selectedCategory = ref(null)
const categoryToDelete = ref(null)
const newCategory = ref({ name: '', configuration: '', image: '' })
const editingCategory = ref({})

const filteredCategories = computed(() => {
  if (!search.value) return categories.value
  return categories.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase()) ||
    c.configuration.toLowerCase().includes(search.value.toLowerCase()),
  )
})

function getPartCount(category) {
  return getCategoryParts(category).length
}

function getCategoryParts(category) {
  const allParts = getAllParts()
  return allParts.filter(p => p.type === category.slug || p.type === category.name)
}

function getAvgPrice(category) {
  const parts = getCategoryParts(category)
  if (parts.length === 0) return '0'
  const avg = parts.reduce((sum, p) => sum + p.price, 0) / parts.length
  return avg.toFixed(2)
}

function getAvgPricePercent(category) {
  const allParts = getAllParts()
  const maxPrice = Math.max(...allParts.map(p => p.price), 100)
  const avg = parseFloat(getAvgPrice(category))
  return (avg / maxPrice) * 100
}

function getTotalValue(category) {
  const parts = getCategoryParts(category)
  const total = parts.reduce((sum, p) => sum + p.price, 0)
  return `$${total.toFixed(2)}`
}

function getAvailableCount(category) {
  return getCategoryParts(category).filter(p => p.availability).length
}

function getCategoryColor(category) {
  const colors = ['primary', 'success', 'warning', 'error', 'info']
  const index = categories.value.indexOf(category) % colors.length
  return colors[index]
}

function previewCategory(category) {
  selectedCategory.value = category
  previewDialog.value = true
}

function goToCategoryDetail(category) {
  router.push({
    path: '/category-detail',
    query: {
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
    },
  })
}

function filterAndNavigateToParts(category) {
  sessionStorage.setItem('partsCategoryFilter', category.name)
  router.push('/parts')
}

function viewPart(part) {
  router.push(`/part-description?id=${part.ID}`)
}

function addToCart(part) {
  store.addToCart({
    id: part.ID,
    name: part.name,
    price: part.price,
    type: part.type,
  })
  snackbarText.value = `${part.name} added to cart!`
  snackbar.value = true
}

function saveCategory() {
  if (newCategory.value.name) {
    categories.value.push({
      ...newCategory.value,
      id: Math.random(),
      slug: newCategory.value.name.toLowerCase().replace(/\s+/g, '-'),
      image: newCategory.value.image || 'https://via.placeholder.com/300x160?text=' + newCategory.value.name,
    })
    newCategory.value = { name: '', configuration: '', image: '' }
    addDialog.value = false
    snackbarText.value = 'Category added!'
    snackbar.value = true
  }
}

function editCategory(category) {
  editingCategory.value = { ...category }
  editDialog.value = true
}

function saveEdit() {
  const idx = categories.value.findIndex(c => c.id === editingCategory.value.id)
  if (idx !== -1) {
    categories.value[idx] = editingCategory.value
  }
  editDialog.value = false
  snackbarText.value = 'Category updated!'
  snackbar.value = true
}

function confirmDelete(category) {
  categoryToDelete.value = category
  deleteDialog.value = true
}

function deleteCategory() {
  categories.value = categories.value.filter(c => c.id !== categoryToDelete.value.id)
  deleteDialog.value = false
  snackbarText.value = 'Category deleted!'
  snackbar.value = true
}
</script>

<style scoped>
.category-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.part-preview-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.part-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.part-preview-status {
  position: absolute;
  bottom: 4px;
  right: 4px;
}
</style>
