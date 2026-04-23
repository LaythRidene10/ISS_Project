<template>
  <div>
    <v-toolbar elevation="1" height="84">
      <template #title>
        <div>
          <h2 class="text-h4 font-weight-bold">My Designs</h2>
          <div class="text-body-2 text-medium-emphasis">Organize, reopen, and share your favorite builds.</div>
        </div>
      </template>
    </v-toolbar>

    <div class="pa-4">
      <v-row class="mb-2">
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="primary">
            <v-card-text>
              <div class="text-overline">Saved Builds</div>
              <div class="text-h5 font-weight-bold">{{ filteredDesigns.length }}</div>
              <div class="text-body-2">Visible with your current filters.</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="success">
            <v-card-text>
              <div class="text-overline">Pinned Designs</div>
              <div class="text-h5 font-weight-bold">{{ favoriteCount }}</div>
              <div class="text-body-2">Quick-access builds you marked as keepers.</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="warning">
            <v-card-text>
              <div class="text-overline">Total Value</div>
              <div class="text-h5 font-weight-bold">${{ totalVisibleValue }}</div>
              <div class="text-body-2">Combined value of the visible designs.</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-4">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="searchTerm"
            clearable
            density="comfortable"
            hide-details
            placeholder="Search by build name, type, or owner..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedType"
            clearable
            density="comfortable"
            hide-details
            :items="typeOptions"
            label="Kart Type"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="sortMode"
            density="comfortable"
            hide-details
            item-title="label"
            item-value="value"
            :items="sortOptions"
            label="Sort"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-row class="mb-3">
        <v-col cols="12">
          <v-chip-group v-model="viewMode" mandatory selected-class="text-primary">
            <v-chip filter value="all">All</v-chip>
            <v-chip filter value="favorites">Pinned</v-chip>
            <v-chip filter value="expensive">High Value</v-chip>
            <v-chip filter value="recent">Recent</v-chip>
          </v-chip-group>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-for="(design, i) in filteredDesigns"
          :key="design.buildID || i"
          cols="12"
          md="4"
          sm="6"
        >
          <v-card class="cursor-pointer h-100" variant="outlined" @click="openDesign(design)">
            <v-sheet border="dashed md" height="120" rounded="0" width="100%" class="d-flex align-center justify-center">
              <v-chip color="primary" variant="tonal">{{ design.type || 'Custom Build' }}</v-chip>
            </v-sheet>
            <v-card-title class="d-flex align-center">
              <span>{{ design.buildName }}</span>
              <v-spacer />
              <v-btn
                :color="isFavorite(design.buildID) ? 'warning' : undefined"
                :icon="isFavorite(design.buildID) ? 'mdi-star' : 'mdi-star-outline'"
                size="small"
                variant="text"
                @click.stop="toggleFavorite(design.buildID)"
              />
              <v-btn
                color="error"
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                @click.stop="confirmDelete(design.buildID)"
              />
            </v-card-title>
            <v-card-subtitle>{{ formatOwner(design.userID) }}</v-card-subtitle>
            <v-card-text class="pb-2">
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span>Parts</span>
                <strong>{{ getPartsCount(design) }}</strong>
              </div>
              <div class="d-flex justify-space-between text-body-2 mb-1">
                <span>Updated</span>
                <strong>{{ formatDate(design.createdAt) }}</strong>
              </div>
              <div class="d-flex justify-space-between text-body-2">
                <span>Price</span>
                <strong>${{ Number(design.price || 0).toFixed(2) }}</strong>
              </div>
            </v-card-text>
            <v-card-actions class="justify-space-between">
              <v-btn prepend-icon="mdi-pencil-outline" size="small" variant="text" @click.stop="openDesign(design)">Edit</v-btn>
              <div class="d-flex gap-1">
                <v-btn icon="mdi-share-variant-outline" size="small" variant="text" @click.stop="openShareDialog(design)" />
                <v-btn icon="mdi-cart-plus" size="small" variant="text" @click.stop="addDesignToCart(design)" />
              </div>
            </v-card-actions>
          </v-card>
        </v-col>

        <template v-if="filteredDesigns.length === 0">
          <v-col cols="12">
            <v-alert variant="tonal" type="info">
              No designs match this view yet. Try changing the filters or start a fresh build.
            </v-alert>
          </v-col>
        </template>

        <v-col cols="12" md="4" sm="6">
          <v-card class="d-flex align-center justify-center cursor-pointer h-100" min-height="220" to="/builder" variant="outlined">
            <v-card-text class="text-center">
              <v-icon class="mb-2" size="48">mdi-plus-circle-outline</v-icon>
              <div class="text-body-1">Add Build</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>

  <v-dialog v-model="deleteDialog" max-width="340">
    <v-card variant="outlined">
      <v-card-text class="text-body-1 pt-5 px-5">Are you sure you want to delete this design?</v-card-text>
      <v-card-actions class="justify-space-between px-4 pb-4">
        <v-btn color="error" variant="outlined" @click="doDelete">Yes</v-btn>
        <v-btn variant="outlined" @click="deleteDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="shareDialog" max-width="420">
    <v-card variant="outlined">
      <v-card-text class="pt-5 px-5 pb-2">
        <div class="text-h6 mb-2">Share Design</div>
        <div class="text-body-2 text-medium-emphasis">
          Choose how you want to share <strong>{{ shareTarget?.buildName || 'this build' }}</strong>.
        </div>
      </v-card-text>
      <v-card-text class="px-5 pb-2">
        <div class="d-flex flex-column gap-3">
          <v-btn block prepend-icon="mdi-go-kart-track" variant="outlined" @click="shareAsBuild">
            Share as Build
          </v-btn>
          <v-btn block color="primary" prepend-icon="mdi-post-outline" variant="elevated" @click="shareAsPost">
            Share as Post
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="closeShareDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" timeout="2200">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { deleteDesignById, getAllDesigns, updateDesignById } from '@/datamodel/design'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const router = useRouter()

  const searchTerm = ref('')
  const selectedType = ref(null)
  const sortMode = ref('recent')
  const viewMode = ref('all')
  const favorites = ref({})
  const deleteDialog = ref(false)
  const deleteId = ref(null)
  const shareDialog = ref(false)
  const shareTarget = ref(null)
  const snackbar = ref(false)
  const snackbarText = ref('')

  const sortOptions = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Highest Price', value: 'price' },
    { label: 'Most Parts', value: 'parts' },
    { label: 'A to Z', value: 'name' },
  ]

  const allDesigns = computed(() => {
    const all = getAllDesigns()
    return store.isLoggedIn
      ? all.filter(d => d.userID === store.currentUser?.email)
      : all
  })

  const typeOptions = computed(() => {
    const uniqueTypes = new Set(allDesigns.value.map(design => design.type).filter(Boolean))
    return [...uniqueTypes]
  })

  const filteredDesigns = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()
    let list = [...allDesigns.value]

    if (query) {
      list = list.filter(design =>
        `${design.buildName} ${design.type} ${design.userID}`.toLowerCase().includes(query),
      )
    }

    if (selectedType.value) {
      list = list.filter(design => design.type === selectedType.value)
    }

    if (viewMode.value === 'favorites') {
      list = list.filter(design => isFavorite(design.buildID))
    } else if (viewMode.value === 'expensive') {
      list = list.filter(design => Number(design.price || 0) >= 2000)
    } else if (viewMode.value === 'recent') {
      list = list.filter(design => {
        if (!design.createdAt) return false
        const age = Date.now() - new Date(design.createdAt).getTime()
        return age <= 1000 * 60 * 60 * 24 * 21
      })
    }

    return list.sort((a, b) => {
      if (sortMode.value === 'price') return Number(b.price || 0) - Number(a.price || 0)
      if (sortMode.value === 'parts') return getPartsCount(b) - getPartsCount(a)
      if (sortMode.value === 'name') return String(a.buildName || '').localeCompare(String(b.buildName || ''))
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })
  })

  const favoriteCount = computed(() =>
    allDesigns.value.filter(design => isFavorite(design.buildID)).length,
  )

  const totalVisibleValue = computed(() =>
    filteredDesigns.value.reduce((sum, design) => sum + Number(design.price || 0), 0).toFixed(2),
  )

  function openDesign (design) {
    router.push(`/builder?id=${design.buildID}`)
  }

  function addDesignToCart (design) {
    store.addToCart({ id: design.buildID, name: design.buildName, price: design.price, type: design.type })
    snackbarText.value = 'Added to cart!'
    snackbar.value = true
  }

  function openShareDialog (design) {
    shareTarget.value = design
    shareDialog.value = true
  }

  function closeShareDialog () {
    shareDialog.value = false
    shareTarget.value = null
  }

  function shareAsBuild () {
    const design = shareTarget.value
    if (!design) return

    updateDesignById(design.buildID, { isShared: true })
    closeShareDialog()
    router.push({
      path: '/builds',
      query: {
        sharedBuildId: design.buildID,
        sharedBuildName: design.buildName || 'Untitled Kart',
      },
    })
  }

  function shareAsPost () {
    const design = shareTarget.value
    if (!design) return

    closeShareDialog()
    router.push({
      path: '/create-post',
      query: {
        buildId: design.buildID,
        buildName: design.buildName || 'Untitled Kart',
        buildType: design.type || '',
        buildPrice: design.price || 0,
      },
    })
  }

  function toggleFavorite (buildID) {
    favorites.value[buildID] = !favorites.value[buildID]
  }

  function isFavorite (buildID) {
    return !!favorites.value[buildID]
  }

  function confirmDelete (buildID) {
    deleteId.value = buildID
    deleteDialog.value = true
  }

  function doDelete () {
    if (deleteId.value) deleteDesignById(deleteId.value)
    deleteDialog.value = false
    deleteId.value = null
    snackbarText.value = 'Design deleted.'
    snackbar.value = true
  }

  function getPartsCount (design) {
    return Array.isArray(design.parts) ? design.parts.length : Object.values(design.parts || {}).filter(Boolean).length
  }

  function formatDate (value) {
    if (!value) return 'Recently saved'
    return new Date(value).toLocaleDateString()
  }

  function formatOwner (value) {
    return value || 'Guest build'
  }
</script>
