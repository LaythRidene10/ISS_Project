<template>
  <v-app-bar flat>
    <template #prepend>
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
    </template>
    <v-app-bar-title>Create New Post</v-app-bar-title>
    <v-spacer />
    <template #append>
      <v-chip class="ms-2" color="primary" variant="tonal">{{ postStatus }}</v-chip>
    </template>
  </v-app-bar>

  <div class="create-post-page">
    <v-toolbar elevation="1" height="84">
      <template #title>
        <div>
          <h2 class="text-h4 font-weight-bold">Share Your Build</h2>
          <div class="text-body-2 text-medium-emphasis">Create a post with live preview before you publish it.</div>
        </div>
      </template>
    </v-toolbar>

    <div class="pa-4">
      <!-- Linked build banner -->
      <v-alert
        v-if="linkedBuildId"
        class="mb-4"
        color="primary"
        icon="mdi-go-kart"
        variant="tonal"
        density="compact"
      >
        Posting from build <strong>{{ linkedBuildName }}</strong> — edit the caption below before publishing.
      </v-alert>

      <v-row>
        <v-col cols="12" lg="7">
          <v-card class="composer-card" variant="outlined">
            <v-card-text class="pb-2">
              <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
                <v-btn-toggle v-model="postType" color="primary" density="comfortable" mandatory variant="outlined">
                  <v-btn prepend-icon="mdi-image-outline" value="photo">Photo</v-btn>
                  <v-btn prepend-icon="mdi-video-outline" value="video">Video</v-btn>
                  <v-btn prepend-icon="mdi-go-kart" value="build">Build</v-btn>
                </v-btn-toggle>

                <div class="d-flex flex-wrap gap-2">
                  <v-chip size="small" variant="tonal">{{ mediaLabel }}</v-chip>
                  <v-chip size="small" variant="tonal">{{ caption.length }}/280</v-chip>
                </div>
              </div>

              <v-sheet
                :class="['upload-zone', { 'upload-zone--active': isDragging }]"
                border="md"
                rounded="xl"
                @click="triggerUpload"
                @dragenter.prevent="isDragging = true"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDrop"
              >
                <div v-if="!preview" class="upload-zone__empty">
                  <v-icon class="mb-4 text-primary" size="52">{{ uploadIcon }}</v-icon>
                  <div class="text-h6 font-weight-bold mb-2">{{ uploadTitle }}</div>
                  <div class="text-body-2 text-medium-emphasis mb-4">{{ uploadHint }}</div>
                  <div class="d-flex flex-wrap justify-center gap-2">
                    <v-chip size="small" variant="outlined">Drag & drop</v-chip>
                    <v-chip size="small" variant="outlined">Click to browse</v-chip>
                    <v-chip size="small" variant="outlined">{{ acceptedLabel }}</v-chip>
                  </div>
                </div>

                <div v-else class="upload-zone__preview">
                  <v-img
                    v-if="isImagePreview"
                    class="preview-media"
                    cover
                    rounded="xl"
                    :src="preview"
                  />
                  <video
                    v-else
                    class="preview-media preview-media--video"
                    controls
                    :src="preview"
                  />

                  <div class="preview-toolbar">
                    <v-chip color="surface" size="small" variant="elevated">{{ selectedFileName || 'Uploaded media' }}</v-chip>
                    <v-btn color="white" icon="mdi-close" size="small" variant="flat" @click.stop="clearMedia" />
                  </div>
                </div>

                <input
                  ref="fileInput"
                  :accept="acceptedTypes"
                  class="d-none"
                  type="file"
                  @change="onFileSelected"
                >
              </v-sheet>
            </v-card-text>

            <v-divider />

            <v-card-text>
              <v-textarea
                v-model="caption"
                auto-grow
                class="mb-3"
                counter="280"
                density="compact"
                label="Tell the community what makes this setup special"
                rows="4"
                variant="outlined"
              />

              <v-row dense>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="filter"
                    density="compact"
                    hide-details
                    :items="filters"
                    label="Visual Mood"
                    prepend-inner-icon="mdi-palette-outline"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="audience"
                    density="compact"
                    hide-details
                    :items="audiences"
                    label="Audience"
                    prepend-inner-icon="mdi-account-group-outline"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider />

            <v-card-actions class="px-4 py-4 d-flex flex-wrap justify-space-between gap-3">
              <div class="text-body-2 text-medium-emphasis">
                {{ helperCopy }}
              </div>
              <div class="d-flex gap-2">
                <v-btn variant="text" @click="resetComposer">Reset</v-btn>
                <v-btn
                  color="primary"
                  :disabled="!canSubmit"
                  :loading="posting"
                  prepend-icon="mdi-send"
                  variant="elevated"
                  @click="submitPost"
                >
                  Publish Post
                </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-card class="preview-card" variant="outlined">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Live Preview</span>
              <v-chip color="primary" size="small" variant="tonal">{{ audience }}</v-chip>
            </v-card-title>

            <v-card-text>
              <div class="d-flex align-center gap-3 mb-4">
                <v-avatar color="primary" size="44" variant="tonal">
                  {{ authorInitials }}
                </v-avatar>
                <div>
                  <div class="font-weight-bold">{{ authorName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ postTypeLabel }} post · {{ filter }}</div>
                </div>
              </div>

              <div v-if="preview" class="preview-stage mb-4">
                <v-img
                  v-if="isImagePreview"
                  class="preview-stage__media"
                  cover
                  rounded="lg"
                  :src="preview"
                />
                <video
                  v-else
                  class="preview-stage__media preview-stage__media--video"
                  controls
                  :src="preview"
                />
              </div>
              <div v-else class="preview-stage preview-stage--empty mb-4">
                <v-icon class="mb-2 text-medium-emphasis" size="40">{{ uploadIcon }}</v-icon>
                <div class="font-weight-medium">Your media preview will appear here</div>
              </div>

              <div class="text-body-1 mb-4">
                {{ caption || 'A sharp caption helps your post feel alive. Show off the build, the setup, or the story behind it.' }}
              </div>

              <div class="d-flex flex-wrap gap-2">
                <v-chip size="small" variant="outlined">{{ postTypeLabel }}</v-chip>
                <v-chip size="small" variant="outlined">{{ filter }}</v-chip>
                <v-chip v-if="captionWordCount" size="small" variant="outlined">{{ captionWordCount }} words</v-chip>
                <v-chip v-if="linkedBuildId" size="small" color="primary" variant="tonal" prepend-icon="mdi-link">
                  Linked Build
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>

  <v-snackbar v-model="snackbar" timeout="2500">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { addPost, Post } from '@/datamodel/post'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const router = useRouter()
  const route = useRoute()

  const postType = ref('photo')
  const filter = ref('None')
  const audience = ref('Community')
  const caption = ref('')
  const preview = ref(null)
  const fileInput = ref(null)
  const posting = ref(false)
  const snackbar = ref(false)
  const snackbarText = ref('')
  const isDragging = ref(false)
  const selectedFileName = ref('')
  const selectedFileType = ref('')

  // Build link state — populated when arriving from /builds via "Post This Build"
  const linkedBuildId = ref(null)
  const linkedBuildName = ref('')

  const filters = ['None', 'Vintage', 'Sharp', 'Vivid', 'Matte', 'Cool', 'Warm']
  const audiences = ['Community', 'Followers', 'Public']

  // Pre-fill from query params when arriving from the Builds page
  onMounted(() => {
    const { buildId, buildName, buildType, buildPrice } = route.query
    if (buildId) {
      linkedBuildId.value = buildId
      linkedBuildName.value = buildName || 'Unknown Build'
      postType.value = 'build'
      caption.value = `Check out my ${buildType || 'custom'} build: ${buildName} — $${Number(buildPrice).toFixed(2)} 🏎️`
    }
  })

  const postTypeLabel = computed(() => {
    return {
      photo: 'Photo',
      video: 'Video',
      build: 'Build',
    }[postType.value]
  })

  const acceptedTypes = computed(() => (postType.value === 'video' ? 'video/*' : 'image/*,video/*'))
  const acceptedLabel = computed(() => (postType.value === 'video' ? 'Video files' : 'Images or videos'))
  const uploadIcon = computed(() => {
    return {
      photo: 'mdi-image-plus-outline',
      video: 'mdi-video-plus-outline',
      build: 'mdi-go-kart-track',
    }[postType.value]
  })
  const uploadTitle = computed(() => {
    return {
      photo: 'Drop a photo that captures the moment',
      video: 'Drop a video clip for your post',
      build: 'Show off the build with a hero image or video',
    }[postType.value]
  })
  const uploadHint = computed(() => {
    return {
      photo: 'Great for close-ups, finished builds, and paddock moments.',
      video: 'Perfect for fly-bys, launches, or quick garage walk-throughs.',
      build: 'Highlight your chassis, parts combination, or completed setup.',
    }[postType.value]
  })
  const mediaLabel = computed(() => (preview.value ? 'Media Ready' : 'No Media Yet'))
  const canSubmit = computed(() => Boolean(caption.value.trim() || preview.value))
  const isImagePreview = computed(() => !selectedFileType.value || selectedFileType.value.startsWith('image/'))
  const authorName = computed(() => store.currentUser?.email || 'anonymous')
  const authorInitials = computed(() => authorName.value.slice(0, 2).toUpperCase())
  const captionWordCount = computed(() => caption.value.trim() ? caption.value.trim().split(/\s+/).length : 0)
  const postStatus = computed(() => canSubmit.value ? 'Ready to Publish' : 'Draft')
  const helperCopy = computed(() => {
    if (!caption.value && !preview.value) return 'Add media, a caption, or both to make the post feel complete.'
    if (!preview.value) return 'A caption-only post works, but media will make it pop more in the feed.'
    if (!caption.value.trim()) return 'Your media is ready. Add a caption if you want more context.'
    return 'Everything looks good. Publish when you are ready.'
  })

  function triggerUpload () {
    fileInput.value?.click()
  }

  function readFile (file) {
    if (!file) return

    selectedFileName.value = file.name
    selectedFileType.value = file.type || ''

    const reader = new FileReader()
    reader.addEventListener('load', evt => {
      preview.value = evt.target?.result || null
    })
    reader.readAsDataURL(file)
  }

  function onFileSelected (e) {
    const file = e.target.files?.[0]
    readFile(file)
  }

  function onDrop (e) {
    isDragging.value = false
    const file = e.dataTransfer?.files?.[0]
    readFile(file)
  }

  function clearMedia () {
    preview.value = null
    selectedFileName.value = ''
    selectedFileType.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  function resetComposer () {
    postType.value = 'photo'
    filter.value = 'None'
    audience.value = 'Community'
    caption.value = ''
    linkedBuildId.value = null
    linkedBuildName.value = ''
    clearMedia()
  }

  function submitPost () {
    if (!canSubmit.value) return

    posting.value = true
    setTimeout(() => {
      const post = new Post({
        build_id: linkedBuildId.value || crypto.randomUUID(),
        user_name: store.currentUser?.email || 'anonymous',
        description: caption.value.trim(),
        image: preview.value,
        comments: [],
        shares: 0,
      })
      addPost(post)
      snackbarText.value = 'Post published!'
      snackbar.value = true
      posting.value = false
      setTimeout(() => router.push('/posts'), 900)
    }, 500)
  }
</script>

<style scoped>
  .create-post-page {
    background:
      radial-gradient(circle at top left, rgba(255, 153, 0, 0.18), transparent 28%),
      radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.08), transparent 24%),
      linear-gradient(180deg, rgba(8, 8, 8, 1), rgba(18, 18, 18, 1));
    min-height: calc(100vh - 64px);
  }

  /* Light mode background */
  [data-theme="light"] .create-post-page,
  .light-mode .create-post-page {
    background:
      radial-gradient(circle at top left, rgba(230, 57, 70, 0.06), transparent 28%),
      radial-gradient(circle at bottom right, rgba(230, 57, 70, 0.04), transparent 24%),
      linear-gradient(180deg, #F8F9FA, #F5F7FB);
  }

  .composer-card,
  .preview-card {
    backdrop-filter: blur(8px);
    background: rgba(20, 20, 20, 0.9);
  }

  /* Light mode cards */
  [data-theme="light"] .composer-card,
  [data-theme="light"] .preview-card,
  .light-mode .composer-card,
  .light-mode .preview-card {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(230, 57, 70, 0.08);
  }

  .upload-zone {
    align-items: center;
    background:
      linear-gradient(135deg, rgba(28, 28, 28, 0.98), rgba(18, 18, 18, 0.96)),
      repeating-linear-gradient(
        45deg,
        rgba(255, 153, 0, 0.06),
        rgba(255, 153, 0, 0.06) 14px,
        transparent 14px,
        transparent 28px
      );
    color: rgba(255, 255, 255, 0.92);
    cursor: pointer;
    display: flex;
    justify-content: center;
    min-height: 320px;
    overflow: hidden;
    padding: 20px;
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  /* Light mode upload zone */
  [data-theme="light"] .upload-zone,
  .light-mode .upload-zone {
    background:
      linear-gradient(135deg, rgba(248, 249, 250, 0.98), rgba(245, 247, 251, 0.96)),
      repeating-linear-gradient(
        45deg,
        rgba(230, 57, 70, 0.03),
        rgba(230, 57, 70, 0.03) 14px,
        transparent 14px,
        transparent 28px
      );
    color: #1A1A1A;
    border-color: rgba(230, 57, 70, 0.12);
  }

  .upload-zone:hover,
  .upload-zone--active {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  [data-theme="light"] .upload-zone:hover,
  [data-theme="light"] .upload-zone--active,
  .light-mode .upload-zone:hover,
  .light-mode .upload-zone--active {
    box-shadow: 0 18px 44px rgba(230, 57, 70, 0.08);
  }

  .upload-zone__empty {
    max-width: 440px;
    text-align: center;
  }

  .upload-zone__preview {
    height: 100%;
    inset: 0;
    position: absolute;
    width: 100%;
  }

  .preview-media,
  .preview-media--video {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  .preview-toolbar {
    align-items: center;
    display: flex;
    justify-content: space-between;
    left: 0;
    padding: 16px;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .preview-stage {
    align-items: center;
    background: linear-gradient(180deg, rgba(22, 22, 22, 1), rgba(14, 14, 14, 1));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    display: flex;
    justify-content: center;
    min-height: 240px;
    overflow: hidden;
  }

  /* Light mode preview stage */
  [data-theme="light"] .preview-stage,
  .light-mode .preview-stage {
    background: linear-gradient(180deg, rgba(245, 247, 251, 1), rgba(248, 249, 250, 1));
    border-color: rgba(230, 57, 70, 0.08);
  }

  .preview-stage--empty {
    color: rgba(255, 255, 255, 0.72);
    flex-direction: column;
    text-align: center;
  }

  /* Light mode preview stage empty text */
  [data-theme="light"] .preview-stage--empty,
  .light-mode .preview-stage--empty {
    color: #1A1A1A;
  }

  .preview-stage__media,
  .preview-stage__media--video {
    height: 240px;
    object-fit: cover;
    width: 100%;
  }
</style>