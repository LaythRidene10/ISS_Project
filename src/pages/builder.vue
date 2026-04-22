<template>
  <v-app-bar flat>
    <template #prepend>
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
    </template>

    <v-app-bar-title>Builder</v-app-bar-title>

    <v-spacer />
    <v-btn icon="mdi-delete-outline" variant="text" @click="deleteDialog = true" />
  </v-app-bar>

  <div>
    <v-toolbar elevation="1" height="84">
      <template #title>
        <div class="d-flex align-center gap-3">
          <h2 class="text-h4 font-weight-bold">{{ kartName || 'Name of the Kart' }}</h2>
          <v-chip v-if="selectedType" size="small" variant="tonal">{{ selectedType }}</v-chip>
          <v-chip v-if="editingDesignId" size="small" color="primary" variant="outlined">Editing Saved Design</v-chip>
          <v-chip v-if="hasUnsavedChanges" size="small" color="warning" variant="outlined">Unsaved Changes</v-chip>
        </div>
      </template>
    </v-toolbar>

    <div class="pa-4">
      <v-row class="mb-2">
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="primary">
            <v-card-text>
              <div class="text-overline">Completion</div>
              <div class="text-h5 font-weight-bold">{{ completionRate }}%</div>
              <div class="text-body-2">Selected {{ selectedCount }} of {{ PART_TYPES.length }} core parts.</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="tonal" :color="incompatibleParts.length ? 'warning' : 'success'">
            <v-card-text>
              <div class="text-overline">Compatibility</div>
              <div class="text-h5 font-weight-bold">{{ incompatibleParts.length ? 'Check Needed' : 'Clean Build' }}</div>
              <div class="text-body-2">{{ compatibilitySummary }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="info">
            <v-card-text>
              <div class="text-overline">Total Price</div>
              <div class="text-h5 font-weight-bold">${{ totalPrice.toFixed(2) }}</div>
              <div class="text-body-2">{{ selectedPartNames.length ? selectedPartNames[0] : 'Start selecting parts' }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="8">
          <v-select
            v-model="selectedType"
            class="mb-3"
            density="compact"
            :items="DESIGN_TYPES"
            label="Kart Type"
            variant="outlined"
          />

          <v-text-field
            v-model="kartName"
            class="mb-3"
            density="compact"
            label="Kart Name"
            variant="outlined"
          />

          <!-- KART PREVIEW WITH LAYERING SYSTEM -->
          <div class="kart-preview-wrapper">
            <div class="kart-display-area">
              <!-- Base kart image (bottom layer) -->
              <img
                :src="baseImageUrl"
                alt="Kart base"
                class="kart-image"
              />
              
              <!-- Overlay container - layers stack in order (bottom to top) -->
              <div class="kart-overlays-container">
                <!-- Layer 1: Color overlay -->
                <img
                  v-if="selectedParts.color"
                  :src="getColorOverlayImage()"
                  alt="Color overlay"
                  class="kart-overlay"
                />
                
                <!-- Layer 2: Seat overlay -->
                <img
                  v-if="selectedParts.seat"
                  :src="getSeatOverlayImage()"
                  alt="Seat overlay"
                  class="kart-overlay"
                />
                
                <!-- Layer 3: Frame overlay -->
                <img
                  v-if="selectedParts.frame"
                  :src="getFrameOverlayImage()"
                  alt="Frame overlay"
                  class="kart-overlay"
                />
                
                <!-- Layer 4: Wheel overlay (TOP LAYER - changes based on wheel selection) -->
                <img
                  v-if="selectedParts.wheel"
                  :src="getWheelOverlayImage()"
                  alt="Wheel overlay"
                  class="kart-overlay"
                />
              </div>
            </div>

            <div class="mood-selector">
              <v-chip-group v-model="selectedMood" mandatory selected-class="text-primary">
                <v-chip v-for="preset in photoMoodOptions" :key="preset" filter :value="preset">
                  {{ preset }}
                </v-chip>
              </v-chip-group>
            </div>
          </div>

          <v-card class="mb-4" variant="outlined">
            <v-card-title class="d-flex align-center justify-space-between">
              Quick Build Presets
              <v-btn size="x-small" variant="text" @click="resetParts">Reset</v-btn>
            </v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="preset in buildPresets"
                  :key="preset.name"
                  filter
                  variant="outlined"
                  @click="applyPreset(preset)"
                >
                  {{ preset.name }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card class="mb-4" variant="outlined">
            <v-card-title>Modifications</v-card-title>
            <v-card-text>
              <v-select
                v-model="selectedParts.color"
                :items="colorSelectItems"
                item-title="label"
                item-value="value"
                label="Color"
                density="compact"
                variant="outlined"
                clearable
                class="mb-4"
              >
                <template #selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon :color="item.raw.colorName.toLowerCase()" size="small" class="mr-2">mdi-circle</v-icon>
                    {{ item.raw.colorName }}
                  </div>
                </template>
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" density="compact">
                    <template #prepend>
                      <v-icon :color="item.raw.colorName.toLowerCase()" size="small">mdi-circle</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <div v-for="type in PART_TYPES" :key="type" class="mb-4">
                <v-select
                  v-model="selectedParts[type]"
                  class="flex-grow-1"
                  clearable
                  density="compact"
                  item-title="name"
                  item-value="ID"
                  :items="getCompatiblePartsForType(type)"
                  :label="capitalize(type)"
                  variant="outlined"
                >
                  <template #append-inner>
                    <v-tooltip activator="parent" location="top">
                      {{ getSelectionHint(type) }}
                    </v-tooltip>
                  </template>
                </v-select>
              </div>
            </v-card-text>
          </v-card>

          <v-alert
            v-if="incompatibleParts.length > 0"
            class="mb-3"
            density="compact"
            type="warning"
            variant="tonal"
          >
            Incompatible part(s): {{ incompatibleParts.join(', ') }}
          </v-alert>

          <v-card class="mb-4" variant="outlined">
            <v-card-title>Build Summary</v-card-title>
            <v-list lines="two">
              <v-list-item
                v-for="part in selectedPartsList"
                :key="part.ID"
                :subtitle="`${capitalize(part.type)} · $${Number(part.price || 0).toFixed(2)}`"
                :title="part.name"
              >
                <template #prepend>
                  <v-avatar rounded="lg" size="42">
                    <v-img v-if="part.image" :src="part.image" cover />
                    <v-icon v-else>mdi-cog-outline</v-icon>
                  </v-avatar>
                </template>
              </v-list-item>
              <v-list-item v-if="selectedParts.color">
                <template #prepend>
                  <v-avatar rounded="lg" size="42">
                    <v-icon>mdi-palette-outline</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Color: {{ getColorName(selectedParts.color) }}</v-list-item-title>
                <v-list-item-subtitle>Custom finish</v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="selectedPartsList.length === 0 && !selectedParts.color" title="No parts selected yet" subtitle="Use the selectors to start shaping the build." />
            </v-list>
          </v-card>

          <v-card variant="outlined">
            <v-card-title>Recommendations</v-card-title>
            <v-card-text>
              <div class="text-body-2 mb-2">{{ nextRecommendation }}</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip v-for="tip in builderTips" :key="tip" size="small" variant="tonal">{{ tip }}</v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-3" />

      <div class="d-flex flex-wrap justify-space-between gap-2">
        <v-btn
          class="text-none flex-grow-1"
          prepend-icon="mdi-content-save-outline"
          size="small"
          variant="outlined"
          @click="saveDialog = true"
        >
          {{ editingDesignId ? 'Update Design' : 'Save Design' }}
        </v-btn>
        <v-btn
          class="text-none flex-grow-1"
          prepend-icon="mdi-cart-plus"
          size="small"
          variant="outlined"
          @click="addToCart"
        >
          Add to Cart
        </v-btn>
        <v-btn
          class="text-none flex-grow-1"
          prepend-icon="mdi-share-variant-outline"
          size="small"
          variant="outlined"
          @click="shareBuild"
        >
          Share
        </v-btn>
      </div>

      <v-snackbar v-model="snackbar" location="bottom" timeout="2200">
        {{ snackbarText }}
      </v-snackbar>
    </div>
  </div>

  <v-dialog v-model="saveDialog" max-width="340">
    <v-card variant="outlined">
      <v-card-text class="text-body-1 pt-5 pb-2 px-5">
        {{ editingDesignId ? 'Update This Design' : 'Save This Design' }}
      </v-card-text>
      <v-card-actions class="justify-space-between px-4 pb-4">
        <v-btn variant="outlined" @click="doSave">Confirm</v-btn>
        <v-btn variant="outlined" @click="saveDialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="340">
    <v-card variant="outlined">
      <v-card-text class="text-body-1 pt-5 pb-2 px-5">
        Are you sure you want to delete this design?
      </v-card-text>
      <v-card-actions class="justify-space-between px-4 pb-4">
        <v-btn color="error" variant="outlined" @click="doDelete">Yes</v-btn>
        <v-btn variant="outlined" @click="deleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.kart-preview-wrapper {
  margin-bottom: 1.5rem;
}

.kart-display-area {
  position: relative;
  width: 100%;
  height: 450px;
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.kart-display-area:hover {
  border: 3px solid #ff4444;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
}

.kart-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  object-position: center;
  display: block;
}

.kart-overlays-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.kart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  object-position: center;
}

.mood-selector {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}
</style>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addDesign, deleteDesignById, Design, DESIGN_TYPES, getDesignById, updateDesignById } from '@/datamodel/design'
import { 
  getAllParts, 
  getPartById, 
  getCompatibleParts, 
  PART_TYPES, 
  validatePartsSelection, 
  COLOR_OPTIONS,
  getColorOverlayUrl,
  getSeatOverlayUrl,
  getFrameOverlayUrl,
  getWheelOverlayUrl
} from '@/datamodel/part_1'
import { useAppStore } from '@/stores/app'
import baseKartImage from '@/assets/editor/cross kart.png'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

// State
const kartName = ref('')
const selectedType = ref(
  typeof route.query.type === 'string' && DESIGN_TYPES.includes(route.query.type)
    ? route.query.type
    : null,
)
const selectedMood = ref('Track Ready')
const editingDesignId = ref(typeof route.query.id === 'string' ? route.query.id : null)
const deleteDialog = ref(false)
const saveDialog = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')

// Options
const photoMoodOptions = ['Track Ready', 'Street Style', 'Weekend Race']

const buildPresets = [
  { name: 'Budget Starter', parts: { engine: 'p-002', wheel: 'p-004', brake: 'p-005', frame: 'p-008', seat: 'p-010', steering: 'p-011', color: null } },
  { name: 'Balanced Race', parts: { engine: 'p-001', wheel: 'p-003', brake: 'p-005', frame: 'p-007', seat: 'p-009', steering: 'p-011', color: 'c-black' } },
  { name: 'Cross Setup', parts: { engine: 'p-001', wheel: 'p-004', brake: 'p-005', frame: 'p-008', seat: 'p-010', steering: 'p-011', color: 'c-yellow' } },
]

// Selected parts
const selectedParts = reactive(
  Object.fromEntries(PART_TYPES.map(t => [t, null]))
)
selectedParts.color = null

const initialSnapshot = ref('')
const baseImageUrl = baseKartImage

// Color select items
const colorSelectItems = computed(() => {
  return Object.entries(COLOR_OPTIONS).map(([colorId, colorData]) => ({
    label: colorData.name,
    value: colorId,
    colorName: colorData.name,
  }))
})

function getColorName(colorId) {
  return COLOR_OPTIONS[colorId]?.name || 'Unknown'
}

// ===================== OVERLAY FUNCTIONS =====================
// These call the helper functions from part_1.js to get the correct overlay images

function getColorOverlayImage() {
  if (!selectedParts.color) return ''
  const url = getColorOverlayUrl(selectedParts.color)
  console.log(`🎨 Color overlay: ${selectedParts.color} -> ${url}`)
  return url
}

function getSeatOverlayImage() {
  if (!selectedParts.seat) return ''
  const url = getSeatOverlayUrl(selectedParts.seat)
  console.log(`💺 Seat overlay: ${selectedParts.seat} -> ${url}`)
  return url
}

function getFrameOverlayImage() {
  if (!selectedParts.frame) return ''
  const url = getFrameOverlayUrl(selectedParts.frame)
  console.log(`🖼️ Frame overlay: ${selectedParts.frame} -> ${url}`)
  return url
}

function getWheelOverlayImage() {
  if (!selectedParts.wheel) return ''
  const url = getWheelOverlayUrl(selectedParts.wheel)
  console.log(`🛞 Wheel overlay: ${selectedParts.wheel} -> ${url}`)
  return url
}

// Computed properties
const selectedPartsList = computed(() => {
  return Object.entries(selectedParts)
    .filter(([type, partId]) => partId !== null && type !== 'color')
    .map(([, partId]) => getAllParts().find(p => p.ID === partId))
    .filter(part => part !== undefined)
})

const selectedCount = computed(() => {
  return PART_TYPES.filter(type => selectedParts[type] !== null).length
})

const completionRate = computed(() => Math.round((selectedCount.value / PART_TYPES.length) * 100))

const totalPrice = computed(() => selectedPartsList.value.reduce((sum, part) => sum + Number(part.price || 0), 0))

const incompatibleParts = computed(() => {
  const result = validatePartsSelection(selectedParts)
  return result.incompatiblePairs.map(pair => pair.reason)
})

const compatibilitySummary = computed(() =>
  incompatibleParts.value.length
    ? `${incompatibleParts.value.length} compatibility warning(s) found.`
    : 'All selected parts currently work together.',
)

const selectedPartNames = computed(() => selectedPartsList.value.map(p => p.name))

const nextRecommendation = computed(() => {
  if (!selectedType.value) return 'Pick a kart type first so the build feels intentional from the start.'
  if (!selectedParts.frame) return 'Choose a frame next. It anchors compatibility for the rest of the build.'
  if (!selectedParts.engine) return 'Choose an engine after the frame to avoid mismatched performance.'
  if (incompatibleParts.value.length) return 'Resolve the compatibility warning before saving or sharing this build.'
  if (selectedCount.value < PART_TYPES.length) return 'Finish the remaining part slots to complete the setup.'
  return 'Your build is in strong shape. Save it, share it, or add it straight to cart.'
})

const builderTips = computed(() => {
  const tips = []
  if (!selectedParts.frame) tips.push('Start with a frame')
  if (selectedParts.frame && !selectedParts.engine) tips.push('Match the engine next')
  if (selectedCount.value >= 3) tips.push('Preview total cost')
  if (!incompatibleParts.value.length && selectedCount.value >= 4) tips.push('Compatibility looks good')
  return tips.length ? tips : ['Make your first selection']
})

const hasUnsavedChanges = computed(() =>
  initialSnapshot.value !== JSON.stringify({
    kartName: kartName.value,
    selectedType: selectedType.value,
    selectedParts: { ...selectedParts },
  })
)

// Helper functions
function getCompatiblePartsForType(type) {
  const compatible = getCompatibleParts(type, selectedParts)
  return compatible.length ? compatible : getPartsByType(type)
}

function getPartsByType(type) {
  return getAllParts().filter(p => p.type === type)
}

function getSelectionHint(type) {
  const options = getCompatiblePartsForType(type)
  return options.length ? `${options.length} compatible option(s)` : 'No compatible options right now'
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function applyPreset(preset) {
  for (const type of PART_TYPES) {
    selectedParts[type] = preset.parts[type] || null
  }
  selectedParts.color = preset.parts.color || null
  snackbarText.value = `${preset.name} applied.`
  snackbar.value = true
}

function resetParts() {
  for (const type of PART_TYPES) {
    selectedParts[type] = null
  }
  selectedParts.color = null
}

function captureSnapshot() {
  initialSnapshot.value = JSON.stringify({
    kartName: kartName.value,
    selectedType: selectedType.value,
    selectedParts: { ...selectedParts },
  })
}

function loadDesign(designId) {
  resetParts()

  if (!designId) {
    kartName.value = ''
    selectedType.value = route.query.type && DESIGN_TYPES.includes(route.query.type) ? route.query.type : null
    captureSnapshot()
    return
  }

  const design = getDesignById(designId)
  if (!design) {
    editingDesignId.value = null
    kartName.value = ''
    selectedType.value = null
    captureSnapshot()
    return
  }

  kartName.value = design.buildName || ''
  selectedType.value = design.type || null
  selectedParts.color = design.color || null

  if (design.parts) {
    for (const type of PART_TYPES) {
      selectedParts[type] = design.parts[type] || null
    }
  }

  captureSnapshot()
}

// Watchers
watch(
  () => route.query.type,
  type => {
    if (!editingDesignId.value) {
      selectedType.value = typeof type === 'string' && DESIGN_TYPES.includes(type) ? type : null
    }
  },
)

watch(
  () => route.query.id,
  id => {
    editingDesignId.value = typeof id === 'string' ? id : null
    loadDesign(editingDesignId.value)
  },
  { immediate: true },
)

// Watch for wheel selection changes to log which overlay is being used
watch(
  () => selectedParts.wheel,
  (newWheelId) => {
    if (newWheelId) {
      const wheelPart = getPartById(newWheelId)
      console.log(`🛞 Wheel changed to: ${wheelPart?.name} (${newWheelId})`)
      console.log(`📸 Wheel overlay image: ${getWheelOverlayImage()}`)
    }
  }
)

// Actions
function addToCart() {
  if (!kartName.value) {
    snackbarText.value = 'Please enter a kart name first.'
    snackbar.value = true
    return
  }
  store.addToCart({
    id: editingDesignId.value || crypto.randomUUID(),
    name: kartName.value,
    type: selectedType.value,
    price: totalPrice.value,
    parts: { ...selectedParts },
    color: selectedParts.color,
  })
  snackbarText.value = 'Added to cart!'
  snackbar.value = true
}

function doSave() {
  const payload = {
    buildName: kartName.value || 'Untitled Kart',
    type: selectedType.value,
    parts: { ...selectedParts },
    userID: store.currentUser?.email,
    price: totalPrice.value,
    createdAt: new Date().toISOString(),
    color: selectedParts.color,
  }

  if (editingDesignId.value) {
    updateDesignById(editingDesignId.value, payload)
    snackbarText.value = 'Design updated!'
  } else {
    addDesign(new Design(payload))
    snackbarText.value = 'Design saved!'
  }

  captureSnapshot()
  snackbar.value = true
  saveDialog.value = false
}

function shareBuild() {
  router.push({
    path: '/create-post',
    query: {
      buildId: editingDesignId.value || crypto.randomUUID(),
      buildName: kartName.value || 'Untitled Kart',
      buildType: selectedType.value || '',
      buildPrice: totalPrice.value || 0,
    },
  })
}

function doDelete() {
  if (editingDesignId.value) {
    deleteDesignById(editingDesignId.value)
  }
  resetParts()
  kartName.value = ''
  selectedType.value = null
  deleteDialog.value = false
  captureSnapshot()
  router.push('/my-designs')
}
</script>