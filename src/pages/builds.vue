<template>
  <v-layout>
    <v-main>
      <v-toolbar elevation="1" height="84">
        <template #title>
          <div>
            <h2 class="text-h4 font-weight-bold">Builds</h2>
            <div class="text-body-2 text-medium-emphasis">Saved designs ready to explore or remix.</div>
          </div>
        </template>
        <template #append>
          <v-text-field
            v-model="searchTerm"
            clearable
            density="comfortable"
            hide-details
            placeholder="Search builds..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            class="me-4"
            style="width: clamp(260px, 38vw, 640px)"
          />
        </template>
      </v-toolbar>

      <div class="pa-4">
        <v-row>
          <v-col v-for="design in filteredBuilds" :key="design.buildID" cols="12" sm="6" md="4">
            <v-card variant="outlined" class="h-100" @click="openDetailsDialog(design)">
              <v-sheet border="dashed md" height="140" rounded="0" width="100%" class="d-flex align-center justify-center">
                <v-chip color="primary" variant="tonal">{{ design.type || 'Custom Build' }}</v-chip>
              </v-sheet>
              <v-card-title>{{ design.buildName }}</v-card-title>
              <v-card-subtitle>{{ design.userID || 'guest@karthub.com' }} · {{ formatDate(design.createdAt) }}</v-card-subtitle>
              <v-card-text>
                <div class="text-body-2 mb-2">{{ getPartsCount(design) }} selected parts</div>
                <div class="text-h6 font-weight-bold">${{ Number(design.price || 0).toFixed(2) }}</div>
              </v-card-text>
              <v-card-actions class="justify-space-between">
                <v-btn
                  v-if="canManageBuild(design)"
                  variant="text"
                  size="small"
                  prepend-icon="mdi-pencil-outline"
                  @click.stop="openBuild(design)"
                >
                  Open
                </v-btn>
                <span v-else />

                <div class="d-flex gap-2">
                  <v-btn
                    v-if="canManageBuild(design)"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-post-outline"
                    @click.stop="postBuild(design)"
                  >
                    Post This Build
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-cart-plus"
                    @click.stop="addBuildToCart(design)"
                  >
                    Add to Cart
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col v-if="filteredBuilds.length === 0" cols="12">
            <v-alert variant="tonal" type="info">No builds match this search yet.</v-alert>
          </v-col>
        </v-row>
      </div>
    </v-main>
  </v-layout>

  <!-- Build Details Dialog -->
  <v-dialog v-model="detailsDialog" max-width="700">
    <v-card v-if="selectedDesign">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <div class="text-h5">{{ selectedDesign.buildName }}</div>
          <div class="text-caption text-medium-emphasis">{{ selectedDesign.type || 'Custom Build' }}</div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" sm="6">
            <!-- Build Info -->
            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">OWNER</div>
              <div class="text-body-2">{{ selectedDesign.userID || 'guest@karthub.com' }}</div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">CREATED</div>
              <div class="text-body-2">{{ formatDate(selectedDesign.createdAt) }}</div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">TOTAL PRICE</div>
              <div class="text-h6 font-weight-bold">${{ Number(selectedDesign.price || 0).toFixed(2) }}</div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-medium-emphasis mb-1">PARTS COUNT</div>
              <div class="text-body-2">{{ getPartsCount(selectedDesign) }} parts selected</div>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-if="canManageBuild(selectedDesign)"
                color="primary"
                prepend-icon="mdi-pencil-outline"
                variant="flat"
                @click="openBuild(selectedDesign)"
              >
                Open in Builder
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-cart-plus"
                @click="addBuildToCart(selectedDesign); detailsDialog = false"
              >
                Add to Cart
              </v-btn>
            </div>
          </v-col>

          <v-col cols="12" sm="6">
            <!-- Parts List -->
            <div class="text-caption text-medium-emphasis mb-2">SELECTED PARTS</div>
            <v-card variant="outlined" class="parts-list-card">
              <v-list lines="two" density="compact" max-height="300" style="overflow-y: auto;">
                <v-list-item
                  v-for="part in getDesignPartsList(selectedDesign)"
                  :key="part.ID"
                  :subtitle="`${capitalize(part.type)} · $${Number(part.price || 0).toFixed(2)}`"
                  :title="part.name"
                >
                  <template #prepend>
                    <v-avatar rounded="lg" size="40">
                      <v-img v-if="part.image" :src="part.image" cover />
                      <v-icon v-else>mdi-cog-outline</v-icon>
                    </v-avatar>
                  </template>
                </v-list-item>
                <v-list-item v-if="getDesignPartsList(selectedDesign).length === 0">
                  <v-list-item-title class="text-medium-emphasis">No parts selected yet</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllDesigns, getSharedDesigns } from '@/datamodel/design'
import { getAllParts } from '@/datamodel/part_1'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const searchTerm = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const detailsDialog = ref(false)
const selectedDesign = ref(null)

// ─── Role helpers ───────────────────────────────────────────────
const currentType = computed(() => store.currentUser?.type)
const currentEmail = computed(() => store.currentUser?.email)

function canManageBuild(design) {
  return !!currentEmail.value && design.userID === currentEmail.value
}
// ────────────────────────────────────────────────────────────────

const builds = computed(() => getSharedDesigns())

const filteredBuilds = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  let list = [...builds.value]
  if (query) {
    list = list.filter(build =>
      `${build.buildName} ${build.type} ${build.userID}`.toLowerCase().includes(query),
    )
  }
  return list
})

watch(
  () => route.query.sharedBuildName,
  sharedBuildName => {
    if (typeof sharedBuildName !== 'string' || !sharedBuildName) return
    searchTerm.value = sharedBuildName
    snackbarText.value = `${sharedBuildName} is now highlighted in the Builds gallery.`
    snackbar.value = true
  },
  { immediate: true },
)

watch(
  () => route.query.viewBuild,
  viewBuild => {
    if (typeof viewBuild !== 'string' || !viewBuild) return
    const design = getAllDesigns().find(d => d.buildID === viewBuild)
    if (design) {
      openDetailsDialog(design)
    }
  },
  { immediate: true },
)

function formatDate(value) {
  if (!value) return 'Recently updated'
  return new Date(value).toLocaleDateString()
}

function getPartsCount(design) {
  return Array.isArray(design.parts) ? design.parts.length : Object.values(design.parts || {}).filter(Boolean).length
}

function openBuild(design) {
  router.push(`/builder?id=${design.buildID}`)
}

function postBuild(design) {
  router.push({
    path: '/create-post',
    query: {
      buildId: design.buildID,
      buildName: design.buildName,
      buildType: design.type || '',
      buildPrice: design.price || 0,
    },
  })
}

function addBuildToCart(design) {
  store.addToCart({
    id: design.buildID,
    name: design.buildName,
    price: design.price,
    type: design.type,
  })
  snackbarText.value = 'Build added to cart.'
  snackbar.value = true
}

function openDetailsDialog(design) {
  selectedDesign.value = design
  detailsDialog.value = true
}

function getDesignPartsList(design) {
  const allParts = getAllParts()
  if (Array.isArray(design.parts)) {
    return design.parts.map(id => allParts.find(p => p.ID === id)).filter(Boolean)
  }
  return Object.values(design.parts || {})
    .map(id => allParts.find(p => p.ID === id))
    .filter(Boolean)
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}
</script>
