<template>
  <div>
    <div v-if="!post" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon class="mb-4 text-medium-emphasis" size="72">mdi-alert-circle-outline</v-icon>
        <div class="text-h6 mb-2">Post not found</div>
        <v-btn to="/posts" variant="outlined">Back to Posts</v-btn>
      </div>
    </div>

    <div v-else class="pa-4">
      <v-card class="mx-auto" max-width="640" variant="outlined">
        <v-card-title class="d-flex align-center justify-space-between py-3">
          <div class="d-flex align-center gap-2">
            <v-icon size="36">mdi-account-circle</v-icon>
            <div>
              <span class="text-body-1 font-weight-bold">{{ post.user_name }}</span>
              <v-icon class="ms-1" color="primary" size="14">mdi-check-circle</v-icon>
            </div>
          </div>
          <v-btn icon="mdi-close" size="small" to="/posts" variant="text" />
        </v-card-title>

        <v-img
          v-if="post.image"
          cover
          height="420"
          :src="post.image"
        />
        <v-sheet
          v-else
          border="dashed md"
          class="d-flex align-center justify-center"
          height="420"
          rounded="0"
          width="100%"
        >
          <v-icon color="grey-darken-2" size="48">mdi-image-outline</v-icon>
        </v-sheet>

        <v-card-text class="pb-1">
          <span class="text-body-2 font-weight-bold">
            {{ post.likes || 0 }} likes · {{ commentCount }} comments · {{ post.shares || 0 }} shares
          </span>
        </v-card-text>

        <v-card-actions class="d-flex justify-space-between px-3 py-2">
          <div class="d-flex gap-1">
            <v-btn :color="hasLiked ? 'error' : undefined" :prepend-icon="hasLiked ? 'mdi-heart' : 'mdi-heart-outline'" variant="text" @click="toggleLike">
              {{ post.likes || 0 }}
            </v-btn>
            <v-btn class="btn-secondary-text" prepend-icon="mdi-comment-outline" variant="text" @click="commentFocus">
              {{ commentCount }}
            </v-btn>
            <v-btn :class="{ 'btn-secondary-text': !hasShared }" :color="hasShared ? 'success' : undefined" :prepend-icon="hasShared ? 'mdi-send' : 'mdi-send-outline'" variant="text" @click="sharePost">
              {{ post.shares || 0 }}
            </v-btn>
          </div>
          <v-btn
            :color="bookmarked ? 'primary' : undefined"
            :icon="bookmarked ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
            variant="text"
            @click="bookmarked = !bookmarked"
          />
        </v-card-actions>

        <v-card-text class="pt-0 pb-1">
          <span class="text-body-2">
            <strong>{{ post.user_name }}</strong> {{ post.description }}
          </span>
        </v-card-text>

        <v-divider />

        <v-card-text class="pt-4 pb-2">
          <div v-if="commentCount">
            <div v-for="comment in post.comments" :key="comment.id" class="mb-3">
              <span class="text-body-2 font-weight-bold">{{ comment.user_name }}</span>
              <span class="text-body-2"> {{ comment.text }}</span>
            </div>
          </div>
          <div v-else class="text-body-2 text-medium-emphasis">No comments yet.</div>
        </v-card-text>

        <v-divider />
        <v-card-text class="d-flex align-center gap-2 py-2">
          <v-text-field
            ref="commentInput"
            v-model="newComment"
            class="flex-grow-1"
            density="compact"
            hide-details
            placeholder="Add a comment..."
            variant="plain"
            @keyup.enter="postComment"
          />
          <v-btn
            :disabled="!newComment.trim()"
            size="small"
            variant="text"
            @click="postComment"
          >
            Post
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import {
    getPostById,
    getPostByBuildId,
    hasUserLikedPost,
    hasUserSharedPost,
    likePostOnce,
    sharePostOnce,
    updatePostByBuildId,
  } from '@/datamodel/post'
  import { useAppStore } from '@/stores/app'

  const store = useAppStore()
  const route = useRoute()

  const bookmarked = ref(false)
  const newComment = ref('')
  const commentInput = ref(null)

  const postId = computed(() => route.query.id)
  const post = computed(() => postId.value ? (getPostById(postId.value) || getPostByBuildId(postId.value)) : null)
  const commentCount = computed(() => post.value?.comments?.length || 0)
  const currentEmail = computed(() => store.currentUser?.email || null)
  const hasLiked = computed(() => post.value ? hasUserLikedPost(currentEmail.value, post.value.build_id) : false)
  const hasShared = computed(() => post.value ? hasUserSharedPost(currentEmail.value, post.value.build_id) : false)

  function commentFocus () {
    commentInput.value?.focus()
  }

  function toggleLike () {
    if (!post.value) return
    likePostOnce(currentEmail.value, post.value.build_id)
  }

  function sharePost () {
    if (!post.value) return
    sharePostOnce(currentEmail.value, post.value.build_id)
  }

  function postComment () {
    if (!post.value || !newComment.value.trim()) return
    updatePostByBuildId(post.value.build_id, {
      comments: [
        ...(post.value.comments || []),
        {
          id: crypto.randomUUID(),
          user_name: store.currentUser?.email || 'anonymous',
          text: newComment.value.trim(),
        },
      ],
    })
    newComment.value = ''
  }
</script>
