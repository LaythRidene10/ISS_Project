<template>
  <div class="home-page">
    <v-toolbar class="home-toolbar" elevation="1" height="84">
      <template #title>
        <div>
          <h2 class="text-h4 font-weight-bold">Home Dashboard</h2>
          <div class="text-body-2 text-medium-emphasis">Build momentum, explore categories, and jump back into the action.</div>
        </div>
      </template>
      <template #append>
        <v-chip color="primary" variant="tonal">{{ welcomeLabel }}</v-chip>
      </template>
    </v-toolbar>

    <div class="pa-4">
      <v-row dense>
        <v-col cols="12" lg="8">
          <v-card class="hero-card mb-4" variant="outlined">
            <div class="hero-grid">
              <div class="hero-copy">
                <v-chip class="mb-4" color="primary" variant="elevated">Interactive Garage</v-chip>
                <div class="text-h3 font-weight-bold mb-4 hero-title">Design the kart you want, then take it from idea to spotlight.</div>
                <div class="text-body-1 text-medium-emphasis mb-6 hero-text">
                  Explore categories, launch straight into the builder, discover parts, and see what the community is creating right now.
                </div>

                <div class="hero-actions d-flex flex-wrap gap-3 mb-6">
                  <v-btn color="primary" prepend-icon="mdi-go-kart-track" to="/categories" variant="elevated">Start Building</v-btn>
                  <v-btn prepend-icon="mdi-calendar-star-outline" to="/events" variant="outlined">Show Events</v-btn>
                  <v-btn prepend-icon="mdi-storefront-outline" to="/parts" variant="outlined">Browse Parts</v-btn>
                </div>

                <v-row dense>
                  <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="4">
                    <v-card class="stat-tile" variant="tonal">
                      <v-card-text>
                        <v-icon class="mb-3" color="primary" size="28">{{ stat.icon }}</v-icon>
                        <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                        <div class="text-body-2 text-medium-emphasis">{{ stat.label }}</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <div class="hero-visual">
                <v-card class="hero-panel" variant="outlined">
                  <v-img
                    cover
                    height="360"
                    :src="activeCategory.image"
                  >
                    <div class="hero-panel__overlay">
                      <v-chip class="mb-3" color="primary" size="small" variant="tonal">{{ activeCategory.configuration }}</v-chip>
                      <div class="text-h5 font-weight-bold mb-2">{{ activeCategory.name }}</div>
                      <div class="text-body-2 mb-4 hero-panel__text">{{ activeCategory.description }}</div>
                      <div class="d-flex flex-wrap gap-2">
                        <v-btn
                          color="primary"
                          size="small"
                          variant="elevated"
                          @click="openCategory(activeCategory)"
                        >
                          Explore
                        </v-btn>
                        <v-btn
                          size="small"
                          variant="outlined"
                          @click="startFromCategory(activeCategory)"
                        >
                          Build This
                        </v-btn>
                      </div>
                    </div>
                  </v-img>
                </v-card>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card class="quick-card mb-4" variant="outlined">
            <v-card-title>Quick Launch</v-card-title>
            <v-card-text>
              <v-list class="bg-transparent" lines="two">
                <v-list-item
                  v-for="action in quickActions"
                  :key="action.title"
                  class="quick-action"
                  :prepend-icon="action.icon"
                  :subtitle="action.subtitle"
                  :title="action.title"
                  @click="router.push(action.to)"
                />
              </v-list>
            </v-card-text>
          </v-card>

          <v-card class="quick-card" variant="outlined">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Community Pulse</span>
              <v-chip color="primary" size="small" variant="tonal">{{ recentPosts.length }} live</v-chip>
            </v-card-title>
            <v-card-text>
              <div v-if="recentPosts.length">
                <div
                  v-for="post in recentPosts"
                  :key="post.build_id"
                  class="pulse-item"
                  @click="router.push(`/post-detail?id=${post.build_id}`)"
                >
                  <div class="font-weight-bold mb-1">{{ post.user_name }}</div>
                  <div class="text-body-2 text-medium-emphasis mb-2">{{ truncate(post.description || 'New community post', 84) }}</div>
                  <div class="text-caption text-medium-emphasis">{{ post.likes || 0 }} likes · {{ post.comments?.length || 0 }} comments</div>
                </div>
              </div>
              <div v-else class="text-body-2 text-medium-emphasis">No posts yet. Be the first one to share a build.</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="interactive-card mb-4" variant="outlined">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap gap-2">
          <span>Featured Categories</span>
          <v-chip color="primary" variant="tonal">{{ activeCategory.name }}</v-chip>
        </v-card-title>
        <v-card-text>
          <v-slide-group v-model="activeCategoryIndex" center-active class="mb-4" show-arrows>
            <v-slide-group-item
              v-for="(category, index) in categories"
              :key="category.slug"
              v-slot="{ toggle, isSelected }"
            >
              <v-card
                :class="['category-pill', { 'category-pill--active': isSelected }]"
                min-width="210"
                variant="outlined"
                @click="toggle"
              >
                <v-card-text>
                  <div class="font-weight-bold mb-1">{{ category.name }}</div>
                  <div class="text-body-2 text-medium-emphasis">{{ category.configuration }}</div>
                </v-card-text>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>

          <v-row dense>
            <v-col cols="12" md="7">
              <v-img class="rounded-lg" cover height="320" :src="activeCategory.image" />
            </v-col>
            <v-col cols="12" md="5">
              <div class="text-overline text-medium-emphasis mb-2">Featured Build Path</div>
              <div class="text-h4 font-weight-bold mb-3">{{ activeCategory.name }}</div>
              <div class="text-body-1 text-medium-emphasis mb-4">{{ activeCategory.description }}</div>

              <div class="d-flex flex-wrap gap-2 mb-5">
                <v-chip size="small" variant="outlined">{{ activeCategory.configuration }}</v-chip>
                <v-chip size="small" variant="outlined">Builder Ready</v-chip>
                <v-chip size="small" variant="outlined">Category Guided</v-chip>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <v-btn color="primary" variant="elevated" @click="startFromCategory(activeCategory)">Start This Build</v-btn>
                <v-btn variant="outlined" @click="openCategory(activeCategory)">Learn More</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row dense>
        <v-col cols="12" md="4">
          <v-card class="interactive-card h-100" variant="outlined">
            <v-card-title>Builder Flow</v-card-title>
            <v-card-text>
              <v-timeline density="compact" side="end">
                <v-timeline-item dot-color="primary" fill-dot size="small">
                  <div class="font-weight-bold">Choose a kart type</div>
                  <div class="text-body-2 text-medium-emphasis">Jump in through categories and start with the right setup path.</div>
                </v-timeline-item>
                <v-timeline-item dot-color="primary" fill-dot size="small">
                  <div class="font-weight-bold">Customize parts</div>
                  <div class="text-body-2 text-medium-emphasis">Mix frames, engines, brakes, and wheels in the builder.</div>
                </v-timeline-item>
                <v-timeline-item dot-color="primary" fill-dot size="small">
                  <div class="font-weight-bold">Share and improve</div>
                  <div class="text-body-2 text-medium-emphasis">Post your build, gather feedback, and keep refining.</div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="interactive-card h-100" variant="outlined">
            <v-card-title>What You Can Do</v-card-title>
            <v-card-text>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="item in capabilityItems"
                  :key="item.title"
                  :title="item.title"
                  :text="item.text"
                />
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="interactive-card h-100" variant="outlined">
            <v-card-title>Next Move</v-card-title>
            <v-card-text>
              <div class="text-body-1 text-medium-emphasis mb-4">
                Pick what you want to do next and get there in one click.
              </div>
              <div class="d-flex flex-column gap-3">
                <v-btn block color="primary" prepend-icon="mdi-go-kart" to="/builder" variant="elevated">Open Builder</v-btn>
                <v-btn block prepend-icon="mdi-plus-box-outline" to="/create-post" variant="outlined">Create New Post</v-btn>
                <v-btn block prepend-icon="mdi-information-outline" to="/about" variant="outlined">Learn About KartHub</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { getAllCategories } from '@/datamodel/categories'
  import { getAllPosts } from '@/datamodel/post'
  import { useAppStore } from '@/stores/app'

  const router = useRouter()
  const store = useAppStore()

  const categories = getAllCategories()
  const posts = getAllPosts()
  const activeCategoryIndex = ref(0)

  const activeCategory = computed(() => categories[activeCategoryIndex.value] || categories[0])
  const recentPosts = computed(() => [...posts].slice(-3).reverse())
  const welcomeLabel = computed(() => store.currentUser?.first_name ? `Welcome, ${store.currentUser.first_name}` : 'Ready To Race')

  const stats = computed(() => [
    { icon: 'mdi-shape-outline', label: 'Kart Categories', value: categories.length },
    { icon: 'mdi-forum-outline', label: 'Community Posts', value: posts.length },
    { icon: 'mdi-star-circle-outline', label: 'XP Status', value: store.currentUser?.xpBadge || 'Starter' },
  ])

  const quickActions = [
    {
      icon: 'mdi-go-kart-track',
      title: 'Continue in Builder',
      subtitle: 'Jump straight into customizing your next kart.',
      to: '/builder',
    },
    {
      icon: 'mdi-shape-plus-outline',
      title: 'Explore Categories',
      subtitle: 'Browse build paths from Cross Kart to Pro Kart.',
      to: '/categories',
    },
    {
      icon: 'mdi-account-multiple-outline',
      title: 'See Community Activity',
      subtitle: 'Check new posts, comments, and shared builds.',
      to: '/posts',
    },
  ]

  const capabilityItems = [
    {
      title: 'Build by category',
      text: 'Start from a category and carry that kart type directly into the builder for a faster, guided flow.',
    },
    {
      title: 'Compare parts visually',
      text: 'Browse available parts and explore combinations before committing to your setup.',
    },
    {
      title: 'Share progress publicly',
      text: 'Use the community space to post your work, collect reactions, and keep improving.',
    },
  ]

  function openCategory (category) {
    router.push({
      path: '/category-detail',
      query: { slug: category.slug },
    })
  }

  function startFromCategory (category) {
    router.push({
      path: '/builder',
      query: { type: category.name },
    })
  }

  function truncate (text, maxLength) {
    if (!text || text.length <= maxLength) return text
    return `${text.slice(0, maxLength).trim()}...`
  }
</script>

<style scoped>
  .home-page {
    background:
      radial-gradient(circle at top left, rgba(255, 0, 0, 0.16), transparent 20%),
      radial-gradient(circle at top right, rgba(255, 145, 0, 0.12), transparent 18%),
      linear-gradient(180deg, rgba(0, 0, 0, 1), rgba(12, 12, 12, 1));
    min-height: calc(100vh - 64px);
  }

  /* Light mode backgrounds */
  [data-theme="light"] .home-page,
  .light-mode .home-page {
    background:
      radial-gradient(circle at top left, rgba(230, 57, 70, 0.08), transparent 20%),
      radial-gradient(circle at top right, rgba(230, 57, 70, 0.06), transparent 18%),
      linear-gradient(180deg, #F8F9FA, #F5F7FB);
  }

  .home-toolbar,
  .hero-card,
  .quick-card,
  .interactive-card,
  .stat-tile,
  .hero-panel,
  .category-pill {
    background: rgba(18, 18, 18, 0.9);
    backdrop-filter: blur(8px);
  }

  /* Light mode card backgrounds */
  [data-theme="light"] .home-toolbar,
  [data-theme="light"] .hero-card,
  [data-theme="light"] .quick-card,
  [data-theme="light"] .interactive-card,
  [data-theme="light"] .stat-tile,
  [data-theme="light"] .hero-panel,
  [data-theme="light"] .category-pill,
  .light-mode .home-toolbar,
  .light-mode .hero-card,
  .light-mode .quick-card,
  .light-mode .interactive-card,
  .light-mode .stat-tile,
  .light-mode .hero-panel,
  .light-mode .category-pill {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-color: rgba(230, 57, 70, 0.08);
  }

  .hero-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1.2fr 0.8fr;
    padding: 20px;
  }

  .hero-copy {
    align-self: center;
    padding: 12px 8px;
  }

  .hero-title {
    max-width: 680px;
  }

  .hero-text {
    max-width: 620px;
  }

  .hero-actions {
    align-items: center;
  }

  .hero-actions :deep(.v-btn) {
    flex-shrink: 0;
  }

  .hero-panel__overlay {
    align-items: flex-start;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.76));
    color: white;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: flex-end;
    padding: 20px;
  }

  .hero-panel__text {
    max-width: 420px;
  }

  .pulse-item {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    cursor: pointer;
    margin-bottom: 12px;
    padding: 12px;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .pulse-item:hover {
    border-color: rgba(255, 0, 0, 0.55);
    transform: translateY(-2px);
  }

  .category-pill {
    cursor: pointer;
    margin-right: 12px;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .category-pill:hover,
  .category-pill--active {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-2px);
  }

  .quick-action {
    border-radius: 14px;
    cursor: pointer;
    margin-bottom: 8px;
  }

  @media (max-width: 1100px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 700px) {
    .hero-actions :deep(.v-btn) {
      justify-content: center;
      width: 100%;
    }
  }
</style>
