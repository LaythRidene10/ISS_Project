<template>
  <v-layout>
    <v-main>
      <v-toolbar elevation="1" height="84">
        <template #title>
          <div>
            <h2 class="text-h4 font-weight-bold">Posts</h2>
            <div class="text-body-2 text-medium-emphasis">Active conversations from the garage.</div>
          </div>
        </template>
        <template #append>
          <v-text-field
            v-model="searchTerm"
            clearable
            density="comfortable"
            hide-details
            placeholder="Search people, descriptions, kart names..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            class="me-4"
            style="width: clamp(260px, 38vw, 640px)"
          />
        </template>
      </v-toolbar>

      <div class="pa-4">
        <v-row class="mb-4" v-if="canCreatePost">
          <v-col cols="12" sm="6" md="4">
            <v-btn block variant="outlined" prepend-icon="mdi-plus" to="/create-post" class="text-none">
              Create New Post
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="post in filteredPosts" :key="post.id" cols="12" sm="6" lg="4">
            <v-card variant="outlined" :to="`/post-detail?id=${post.id}`" link class="glass-panel animate-in">
              <v-card-title class="d-flex align-center gap-2">
                <v-icon color="primary">mdi-account-circle</v-icon>
                <span class="text-body-2 font-weight-bold">{{ post.user_name }}</span>
                <v-icon size="small" color="primary">mdi-check-circle</v-icon>
                <v-spacer />
                <v-chip
                  v-if="post.build_id && getBuildForPost(post)"
                  color="primary"
                  size="small"
                  variant="tonal"
                  prepend-icon="mdi-go-kart"
                  class="mr-2 cursor-pointer build-tag"
                  @click.stop.prevent="navigateToBuild(post.build_id)"
                >
                  View Build
                </v-chip>
                <v-btn
                  v-if="canDeletePost(post)"
                  color="error"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  @click.stop="deletePost(post.build_id)"
                />
              </v-card-title>

              <v-card-text class="pt-2 pb-0 text-body-1">
                {{ post.description }}
              </v-card-text>

              <v-img
                v-if="post.image"
                class="my-3"
                cover
                height="180"
                rounded="lg"
                :src="post.image"
              />
              <v-sheet
                v-else
                border="dashed md"
                height="180"
                rounded="lg"
                width="100%"
                class="my-3 d-flex align-center justify-center placeholder-sheet"
              >
                <v-icon size="48" color="grey-darken-3">mdi-image-outline</v-icon>
              </v-sheet>

              <v-card-text class="py-0">
                <div class="text-caption text-medium-emphasis">
                  {{ post.likes }} likes · {{ getCommentCount(post) }} comments · {{ post.shares || 0 }} shares
                </div>
              </v-card-text>

              <v-card-actions class="d-flex justify-space-between">
                <div class="d-flex gap-1">
                  <v-btn
                    :color="hasLiked(post) ? 'error' : 'primary'"
                    :prepend-icon="hasLiked(post) ? 'mdi-heart' : 'mdi-heart-outline'"
                    variant="text"
                    size="small"
                    @click.stop="likePost(post)"
                  >
                    {{ post.likes }}
                  </v-btn>
                  <v-btn
                    prepend-icon="mdi-comment-outline"
                    class="btn-secondary-text"
                    variant="text"
                    size="small"
                    @click.stop="toggleComments(post.build_id)"
                  >
                    {{ getCommentCount(post) }}
                  </v-btn>
                  <v-btn
                    :color="hasShared(post) ? 'success' : undefined"
                    :class="{ 'btn-secondary-text': !hasShared(post) }"
                    :prepend-icon="hasShared(post) ? 'mdi-send' : 'mdi-send-outline'"
                    variant="text"
                    size="small"
                    @click.stop="sharePost(post)"
                  >
                    {{ post.shares || 0 }}
                  </v-btn>
                </div>
                <v-btn
                  :icon="isSaved(post.build_id) ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
                  variant="text"
                  size="small"
                  @click.stop="toggleSave(post.build_id)"
                />
              </v-card-actions>

              <v-expand-transition>
                <div v-show="expandedComments[post.build_id]">
                  <v-divider />
                  <v-card-text class="pt-3 pb-2">
                    <div v-if="getCommentCount(post)" class="mb-3">
                      <div v-for="comment in post.comments" :key="comment.id" class="mb-2">
                        <span class="text-body-2 font-weight-bold">{{ comment.user_name }}</span>
                        <span class="text-body-2"> {{ comment.text }}</span>
                      </div>
                    </div>
                    <div v-else class="text-body-2 text-medium-emphasis mb-3">No comments yet.</div>

                    <div class="d-flex align-center gap-2">
                      <v-text-field
                        v-model="commentInputs[post.build_id]"
                        class="flex-grow-1"
                        density="compact"
                        hide-details
                        placeholder="Add a comment..."
                        variant="outlined"
                        @click.stop
                        @keyup.enter.stop="addPostComment(post)"
                      />
                      <v-btn
                        :disabled="!commentInputs[post.build_id]?.trim()"
                        size="small"
                        variant="text"
                        @click.stop="addPostComment(post)"
                      >
                        Post
                      </v-btn>
                    </div>
                  </v-card-text>
                </div>
              </v-expand-transition>
            </v-card>
          </v-col>

          <v-col v-if="filteredPosts.length === 0" cols="12">
            <v-alert variant="tonal" type="info">No posts match this filter right now.</v-alert>
          </v-col>
        </v-row>
      </div>
    </v-main>
  </v-layout>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  deletePostByBuildId,
  getAllPosts,
  hasUserLikedPost,
  hasUserSharedPost,
  likePostOnce,
  sharePostOnce,
  updatePostByBuildId,
} from '@/datamodel/post'
import { getDesignById } from '@/datamodel/design'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()

const searchTerm = ref('')

function getBuildForPost(post) {
  return getDesignById(post.build_id)
}

function navigateToBuild(buildId) {
  router.push({ path: '/builds', query: { viewBuild: buildId } })
}
const posts = ref(getAllPosts())
const snackbar = ref(false)
const snackbarText = ref('')
const commentInputs = ref({})
const expandedComments = ref({})
const savedPosts = ref({})

// ─── Role helpers ───────────────────────────────────────────────
const currentType = computed(() => store.currentUser?.type)
const currentEmail = computed(() => store.currentUser?.email)
const isAdmin = computed(() => currentType.value === 'admin')
const isSupplier = computed(() => currentType.value === 'supplier')

const canCreatePost = computed(() => isAdmin.value || isSupplier.value)

function canDeletePost(post) {
  if (isAdmin.value) return true
  if (isSupplier.value) return post.user_name === currentEmail.value
  return false
}
// ────────────────────────────────────────────────────────────────

const filteredPosts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  let list = [...posts.value]
  if (query) {
    list = list.filter(post =>
      [post.user_name, post.description, ...(post.comments || []).map(c => c.text)]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }
  return list
})

function deletePost(buildId) {
  const deleted = deletePostByBuildId(buildId)
  if (!deleted) return
  posts.value = getAllPosts()
  snackbarText.value = 'Post deleted.'
  snackbar.value = true
}

function getCommentCount(post) {
  return post.comments?.length || 0
}

function refreshPosts() {
  posts.value = getAllPosts()
}

function hasLiked(post) {
  return hasUserLikedPost(currentEmail.value, post.build_id)
}

function hasShared(post) {
  return hasUserSharedPost(currentEmail.value, post.build_id)
}

function likePost(post) {
  const result = likePostOnce(currentEmail.value, post.build_id)
  if (!result.ok) {
    snackbarText.value = result.reason === 'auth_required'
      ? 'Please sign in to like posts.'
      : 'You already liked this post.'
    snackbar.value = true
    return
  }
  refreshPosts()
  snackbarText.value = 'Post liked.'
  snackbar.value = true
}

function sharePost(post) {
  const result = sharePostOnce(currentEmail.value, post.build_id)
  if (!result.ok) {
    snackbarText.value = result.reason === 'auth_required'
      ? 'Please sign in to share posts.'
      : 'You already shared this post.'
    snackbar.value = true
    return
  }
  refreshPosts()
  snackbarText.value = 'Post shared.'
  snackbar.value = true
}

function addPostComment(post) {
  const text = commentInputs.value[post.build_id]?.trim()
  if (!text) return
  const nextComments = [
    ...(post.comments || []),
    { id: crypto.randomUUID(), user_name: currentEmail.value || 'anonymous', text },
  ]
  updatePostByBuildId(post.build_id, { comments: nextComments })
  commentInputs.value[post.build_id] = ''
  expandedComments.value[post.build_id] = true
  refreshPosts()
  snackbarText.value = 'Comment added.'
  snackbar.value = true
}

function toggleComments(buildId) {
  expandedComments.value[buildId] = !expandedComments.value[buildId]
}

function toggleSave(buildId) {
  savedPosts.value[buildId] = !savedPosts.value[buildId]
  snackbarText.value = savedPosts.value[buildId] ? 'Post saved.' : 'Post removed from saved.'
  snackbar.value = true
}

function isSaved(buildId) {
  return !!savedPosts.value[buildId]
}
</script>

<style scoped>
.build-tag {
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
}

.build-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

/* Placeholder sheet styling */
.placeholder-sheet {
  background-color: rgba(0, 0, 0, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Light mode placeholder styling */
[data-theme="light"] .placeholder-sheet,
.light-mode .placeholder-sheet {
  background-color: #F5F7FB;
  border-color: rgba(230, 57, 70, 0.12);
}

[data-theme="light"] .placeholder-sheet :deep(.v-icon),
.light-mode .placeholder-sheet :deep(.v-icon) {
  color: #999999 !important;
}

/* Glass panel for cards - KEEP DARK in all themes */
.glass-panel {
  backdrop-filter: blur(8px);
  background: rgba(20, 20, 20, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Light mode glass panel - still dark */
[data-theme="light"] .glass-panel,
.light-mode .glass-panel {
  background: rgba(20, 20, 20, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #FFFFFF !important;
}

[data-theme="light"] .glass-panel .text-body-1,
[data-theme="light"] .glass-panel .text-body-2,
[data-theme="light"] .glass-panel .text-caption,
.light-mode .glass-panel .text-body-1,
.light-mode .glass-panel .text-body-2,
.light-mode .glass-panel .text-caption {
  color: #FFFFFF !important;
}
</style>
