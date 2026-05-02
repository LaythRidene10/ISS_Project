<template>
  <div class="profile-page">
    <div v-if="!store.isLoggedIn" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon class="mb-4 text-medium-emphasis" size="72">mdi-account-off-outline</v-icon>
        <div class="text-h6 mb-2">Please sign in to view your profile</div>
        <v-btn class="mt-2" to="/login" variant="outlined">Sign In</v-btn>
      </div>
    </div>

    <div v-else class="pa-4">
      <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-4">
        <div>
          <div class="text-overline text-medium-emphasis">Driver Dashboard</div>
          <h1 class="text-h4 font-weight-bold">My Profile</h1>
        </div>
        <v-btn prepend-icon="mdi-arrow-left" variant="outlined" @click="$router.back()">Back</v-btn>
      </div>

      <v-row class="mb-2">
        <v-col cols="12" lg="8">
          <v-card variant="outlined">
            <v-card-text class="d-flex flex-column flex-md-row align-md-center gap-4">
              <v-avatar color="surface-variant" size="88">
                <v-icon size="52">mdi-account-circle</v-icon>
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex align-center gap-2 mb-1">
                  <span class="text-h6 font-weight-bold">
                    {{ displayName }}
                  </span>
                  <v-icon color="primary" size="18">mdi-check-circle</v-icon>
                </div>
                <div class="text-body-2 text-medium-emphasis mb-3">
                  {{ store.currentUser.email }}
                </div>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <v-chip color="primary" variant="tonal">{{ currentBadge }}</v-chip>
                  <v-chip variant="outlined">{{ xpPoints }} XP</v-chip>
                  <v-chip variant="outlined">{{ postCount }} Posts</v-chip>
                  <v-chip variant="outlined">{{ designCount }} Designs</v-chip>
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ profileHeadline }}
                </div>
              </div>

              <div class="d-flex flex-column gap-2">
                <v-btn prepend-icon="mdi-pencil-outline" variant="outlined" @click="openEditDialog">Edit Profile</v-btn>
                <v-btn prepend-icon="mdi-logout" variant="text" @click="handleLogout">Log Out</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="tonal" color="primary" class="h-100">
            <v-card-text>
              <div class="text-overline">Next Goal</div>
              <div class="text-h6 font-weight-bold mb-2">{{ nextBadge }}</div>
              <v-progress-linear color="primary" height="8" :model-value="xpProgress" rounded />
              <div class="text-body-2 mt-3">{{ xpRemaining }} XP to unlock the next badge.</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="success">
            <v-card-text>
              <div class="text-overline">Engagement</div>
              <div class="text-h5 font-weight-bold">{{ totalLikes }}</div>
              <div class="text-body-2">Total likes across your posts.</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="warning">
            <v-card-text>
              <div class="text-overline">Comments</div>
              <div class="text-h5 font-weight-bold">{{ totalComments }}</div>
              <div class="text-body-2">Community replies on your work.</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card variant="tonal" color="info">
            <v-card-text>
              <div class="text-overline">Cart Value</div>
              <div class="text-h5 font-weight-bold">${{ cartValue }}</div>
              <div class="text-body-2">Current total of items you want to buy.</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchTerm"
            clearable
            density="comfortable"
            hide-details
            prepend-inner-icon="mdi-magnify"
            placeholder="Search your posts..."
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="activityFilter"
            density="comfortable"
            hide-details
            item-title="label"
            item-value="value"
            :items="activityOptions"
            label="Filter"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn-toggle v-model="viewMode" density="compact" variant="outlined" mandatory>
            <v-btn icon="mdi-view-grid-outline" value="grid" />
            <v-btn icon="mdi-view-list-outline" value="list" />
          </v-btn-toggle>
        </v-col>
      </v-row>

      <v-tabs v-model="activeTab" class="mb-4">
        <v-tab value="posts">Posts</v-tab>
        <v-tab value="designs">Designs</v-tab>
        <v-tab value="activity">Activity</v-tab>
      </v-tabs>

      <div v-if="activeTab === 'posts'">
        <div v-if="filteredPosts.length === 0" class="text-center py-8">
          <v-icon class="mb-3 text-medium-emphasis" size="48">mdi-image-off-outline</v-icon>
          <div class="text-body-1 text-medium-emphasis">No posts match this view yet.</div>
          <v-btn class="mt-3" to="/create-post" variant="outlined">Create Your First Post</v-btn>
        </div>

        <v-row v-else-if="viewMode === 'grid'">
          <v-col
            v-for="post in filteredPosts"
            :key="post.build_id"
            cols="12"
            md="4"
            sm="6"
          >
            <v-card link :to="`/post-detail?id=${post.build_id}`" variant="outlined" class="h-100">
              <v-sheet border="dashed md" height="180" rounded="0" width="100%" class="d-flex align-center justify-center">
                <v-icon color="grey-darken-2" size="42">mdi-forum-outline</v-icon>
              </v-sheet>
              <v-card-title class="text-body-1">{{ truncate(post.description, 72) }}</v-card-title>
              <v-card-subtitle>{{ post.likes || 0 }} likes · {{ getCommentCount(post) }} comments</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>

        <v-list v-else lines="two">
          <v-list-item
            v-for="post in filteredPosts"
            :key="post.build_id"
            :subtitle="`${post.likes || 0} likes · ${getCommentCount(post)} comments`"
            :title="truncate(post.description, 100)"
            :to="`/post-detail?id=${post.build_id}`"
            link
          >
            <template #prepend>
              <v-avatar color="primary" variant="tonal">
                <v-icon>mdi-forum-outline</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <div v-else-if="activeTab === 'designs'">
        <v-row>
          <v-col v-for="design in userDesigns" :key="design.buildID" cols="12" md="4" sm="6">
            <v-card variant="outlined" class="h-100">
              <DesignPreviewMedia :design="design" :height="140" />
              <v-card-title>{{ design.buildName }}</v-card-title>
              <v-card-subtitle>${{ Number(design.price || 0).toFixed(2) }} · {{ getDesignPartsCount(design) }} parts</v-card-subtitle>
              <v-card-actions>
                <v-btn prepend-icon="mdi-pencil-outline" size="small" variant="text" :to="`/builder?id=${design.buildID}`">Open</v-btn>
                <v-btn prepend-icon="mdi-folder-multiple-outline" size="small" variant="text" to="/my-designs">Library</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col v-if="userDesigns.length === 0" cols="12">
            <v-alert variant="tonal" type="info">You have not saved any designs yet.</v-alert>
          </v-col>
        </v-row>
      </div>

      <div v-else>
        <v-timeline density="compact" side="end" truncate-line="both">
          <v-timeline-item
            v-for="event in joinedEvents"
            :key="event.id"
            dot-color="info"
            fill-dot
            icon="mdi-calendar-check"
          >
            <div class="text-body-1 font-weight-medium">Joined event</div>
            <div class="text-body-2 text-medium-emphasis">{{ event.title }} - {{ event.date }} - {{ event.location }}</div>
          </v-timeline-item>
          <v-timeline-item dot-color="primary" fill-dot icon="mdi-star-circle-outline">
            <div class="text-body-1 font-weight-medium">Badge progress</div>
            <div class="text-body-2 text-medium-emphasis">{{ xpRemaining }} XP left until {{ nextBadge }}.</div>
          </v-timeline-item>
          <v-timeline-item dot-color="success" fill-dot icon="mdi-pencil-box-outline">
            <div class="text-body-1 font-weight-medium">Saved designs</div>
            <div class="text-body-2 text-medium-emphasis">{{ designCount }} builds are available to reopen and improve.</div>
          </v-timeline-item>
          <v-timeline-item dot-color="warning" fill-dot icon="mdi-forum-outline">
            <div class="text-body-1 font-weight-medium">Community activity</div>
            <div class="text-body-2 text-medium-emphasis">{{ totalComments }} comments and {{ totalLikes }} likes across your posts.</div>
          </v-timeline-item>
          <v-timeline-item v-if="joinedEventCount === 0" dot-color="grey" fill-dot icon="mdi-calendar-remove-outline">
            <div class="text-body-1 font-weight-medium">No event activity yet</div>
            <div class="text-body-2 text-medium-emphasis">Join an event to save it here in your profile activity.</div>
          </v-timeline-item>
        </v-timeline>
      </div>
    </div>
  </div>

  <v-dialog v-model="editDialog" max-width="420">
    <v-card variant="outlined">
      <v-card-title>Edit Profile</v-card-title>
      <v-card-text class="pt-4">
        <v-text-field
          v-model="editForm.firstName"
          class="mb-3"
          density="compact"
          label="First Name"
          variant="outlined"
        />
        <v-text-field
          v-model="editForm.lastName"
          class="mb-3"
          density="compact"
          label="Last Name"
          variant="outlined"
        />
        <v-text-field
          v-model="editForm.headline"
          density="compact"
          label="Headline"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
        <v-btn variant="outlined" @click="saveProfile">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { getAllDesigns } from '@/datamodel/design'
  import { getJoinedEventsByUser } from '@/datamodel/event'
  import { getAllPosts } from '@/datamodel/post'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const router = useRouter()

  const activeTab = ref('posts')
  const viewMode = ref('grid')
  const searchTerm = ref('')
  const activityFilter = ref('all')
  const editDialog = ref(false)
  const snackbar = ref(false)
  const snackbarText = ref('')

  const activityOptions = [
    { label: 'All Posts', value: 'all' },
    { label: 'Popular', value: 'popular' },
    { label: 'Discussed', value: 'discussed' },
  ]

  const displayName = computed(() => {
    const first = store.currentUser?.first_name || ''
    const last = store.currentUser?.last_name || ''
    return `${first} ${last}`.trim() || store.currentUser?.email || 'Driver'
  })

  const profileHeadline = computed(() =>
    store.currentUser?.headline || 'Building faster karts and sharing progress with the community.',
  )

  const xpPoints = computed(() => Number(store.currentUser?.xpPoints || 0))
  const currentBadge = computed(() => {
    if (xpPoints.value < 1000) return 'Beginner'
    if (xpPoints.value < 3000) return 'Intermediate'
    return 'Expert'
  })
  const xpNext = computed(() => xpPoints.value < 1000 ? 1000 : xpPoints.value < 3000 ? 3000 : 5000)
  const nextBadge = computed(() => xpPoints.value < 1000 ? 'Intermediate' : xpPoints.value < 3000 ? 'Expert' : 'Legend')
  const xpProgress = computed(() => {
    const floor = xpPoints.value < 1000 ? 0 : xpPoints.value < 3000 ? 1000 : 3000
    const span = xpNext.value - floor
    return span <= 0 ? 100 : Math.min(((xpPoints.value - floor) / span) * 100, 100)
  })
  const xpRemaining = computed(() => Math.max(xpNext.value - xpPoints.value, 0))

  const allUserPosts = computed(() => {
    if (!store.currentUser) return []
    return getAllPosts().filter(p => p.user_name === store.currentUser.email)
  })

  const filteredPosts = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()
    let list = [...allUserPosts.value]

    if (query) {
      list = list.filter(post => `${post.description} ${post.user_name}`.toLowerCase().includes(query))
    }

    if (activityFilter.value === 'popular') {
      list = list.filter(post => (post.likes || 0) >= 10)
    } else if (activityFilter.value === 'discussed') {
      list = list.filter(post => getCommentCount(post) > 0)
    }

    return list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  })

  const userDesigns = computed(() => {
    if (!store.currentUser) return []
    return getAllDesigns().filter(d => d.userID === store.currentUser.email)
  })

  const joinedEvents = computed(() => {
    if (!store.currentUser) return []
    return getJoinedEventsByUser(store.currentUser.email)
  })

  const postCount = computed(() => allUserPosts.value.length)
  const designCount = computed(() => userDesigns.value.length)
  const joinedEventCount = computed(() => joinedEvents.value.length)
  const totalLikes = computed(() => allUserPosts.value.reduce((sum, post) => sum + Number(post.likes || 0), 0))
  const totalComments = computed(() => allUserPosts.value.reduce((sum, post) => sum + getCommentCount(post), 0))
  const cartValue = computed(() => Number(store.cartTotal || 0).toFixed(2))

  const editForm = ref({
    firstName: '',
    lastName: '',
    headline: '',
  })

  function openEditDialog () {
    editForm.value = {
      firstName: store.currentUser?.first_name || '',
      lastName: store.currentUser?.last_name || '',
      headline: store.currentUser?.headline || '',
    }
    editDialog.value = true
  }

  function saveProfile () {
    store.updateCurrentUser({
      first_name: editForm.value.firstName,
      last_name: editForm.value.lastName,
      headline: editForm.value.headline,
    })
    editDialog.value = false
    snackbarText.value = 'Profile updated.'
    snackbar.value = true
  }

  function handleLogout () {
    store.logout()
    router.push('/login')
  }

  function truncate (value, length) {
    if (!value) return 'Untitled post'
    return value.length > length ? `${value.slice(0, length)}...` : value
  }

  function getCommentCount (post) {
    return post.comments?.length || 0
  }

  function getDesignPartsCount (design) {
    return Array.isArray(design.parts) ? design.parts.length : Object.values(design.parts || {}).filter(Boolean).length
  }
</script>

<style scoped>
  .profile-page {
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at top right, rgba(211, 47, 47, 0.08), transparent 22%),
      linear-gradient(180deg, #050505 0%, #000000 100%);
  }

  /* Light mode background */
  [data-theme="light"] .profile-page,
  .light-mode .profile-page {
    background:
      radial-gradient(circle at top right, rgba(230, 57, 70, 0.06), transparent 22%),
      linear-gradient(180deg, #F8F9FA 0%, #F5F7FB 100%);
  }
</style>
