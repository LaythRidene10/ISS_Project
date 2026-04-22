<template>
  <div class="about-page">
    <v-toolbar class="about-toolbar" elevation="1" height="84">
      <template #title>
        <div>
          <h2 class="text-h4 font-weight-bold">About Us</h2>
          <div class="text-body-2 text-medium-emphasis">The people, the platform, and the racing mindset behind KartHub.</div>
        </div>
      </template>
    </v-toolbar>

    <div class="pa-4">
      <v-row class="mb-2" dense>
        <v-col cols="12" lg="7">
          <v-card class="hero-card" variant="outlined">
            <v-img
              alt="KartHub build customize race showcase"
              class="hero-image"
              cover
              height="520"
              :src="aboutHeroImage"
            >
              <div class="hero-overlay">
                <v-chip class="mb-4" color="primary" variant="elevated">Built For Racers</v-chip>
                <div class="text-h3 font-weight-bold mb-3 hero-title">We turn kart passion into a full custom experience.</div>
                <div class="text-body-1 hero-copy">
                  KartHub brings builders, racers, and dreamers together in one place to design karts, discover parts,
                  share progress, and keep the community moving forward.
                </div>
              </div>
            </v-img>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-row dense>
            <v-col cols="12" sm="4" lg="12">
              <v-card class="stat-card" variant="outlined">
                <v-card-text>
                  <div class="text-overline">Mission</div>
                  <div class="text-h5 font-weight-bold mb-2">Build Faster</div>
                  <div class="text-body-2 text-medium-emphasis">Make kart customization feel simple, visual, and exciting.</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4" lg="12">
              <v-card class="stat-card" variant="outlined">
                <v-card-text>
                  <div class="text-overline">Community</div>
                  <div class="text-h5 font-weight-bold mb-2">Share More</div>
                  <div class="text-body-2 text-medium-emphasis">Turn every setup, event, and idea into something the whole paddock can learn from.</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="4" lg="12">
              <v-card class="stat-card" variant="outlined">
                <v-card-text>
                  <div class="text-overline">Experience</div>
                  <div class="text-h5 font-weight-bold mb-2">Race Smarter</div>
                  <div class="text-body-2 text-medium-emphasis">Help beginners and pros discover better combinations with less trial and error.</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row class="mt-2" dense>
        <v-col cols="12" lg="7">
          <v-card class="interactive-card" variant="outlined">
            <v-card-title class="d-flex align-center justify-space-between flex-wrap gap-2">
              <span>Inside KartHub</span>
              <v-chip color="primary" size="small" variant="tonal">{{ activeTabLabel }}</v-chip>
            </v-card-title>
            <v-card-text>
              <v-tabs v-model="activeTab" color="primary" grow>
                <v-tab value="story">Our Story</v-tab>
                <v-tab value="value">What We Offer</v-tab>
                <v-tab value="future">Where We’re Going</v-tab>
              </v-tabs>

              <v-window v-model="activeTab" class="mt-4">
                <v-window-item value="story">
                  <div class="text-body-1 mb-4">
                    KartHub started from a simple idea: kart building should feel as thrilling as kart racing. Instead of
                    scattered parts lists and disconnected tools, we wanted one place where the full build journey feels connected.
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip size="small" variant="outlined">Builder-first</v-chip>
                    <v-chip size="small" variant="outlined">Visual by design</v-chip>
                    <v-chip size="small" variant="outlined">Made for all levels</v-chip>
                  </div>
                </v-window-item>

                <v-window-item value="value">
                  <v-row dense>
                    <v-col v-for="item in offerCards" :key="item.title" cols="12" md="6">
                      <v-card class="mini-card h-100" variant="tonal">
                        <v-card-text>
                          <v-icon class="mb-3" color="primary" size="30">{{ item.icon }}</v-icon>
                          <div class="font-weight-bold mb-2">{{ item.title }}</div>
                          <div class="text-body-2 text-medium-emphasis">{{ item.text }}</div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-window-item>

                <v-window-item value="future">
                  <div class="text-body-1 mb-4">
                    We’re building toward a smarter platform where racers can compare setups, improve decisions, and stay connected
                    to the entire karting ecosystem from first idea to finished machine.
                  </div>
                  <v-timeline density="compact" side="end">
                    <v-timeline-item
                      v-for="step in futureRoadmap"
                      :key="step.title"
                      dot-color="primary"
                      fill-dot
                      size="small"
                    >
                      <div class="font-weight-bold">{{ step.title }}</div>
                      <div class="text-body-2 text-medium-emphasis">{{ step.text }}</div>
                    </v-timeline-item>
                  </v-timeline>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="5">
          <v-card class="interactive-card h-100" variant="outlined">
            <v-card-title>Why Builders Stay</v-card-title>
            <v-card-text>
              <v-expansion-panels v-model="openPanel" variant="accordion">
                <v-expansion-panel
                  v-for="item in highlights"
                  :key="item.title"
                  :title="item.title"
                  :text="item.text"
                />
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import aboutHeroImage from '@/assets/about-karthub-hero-2.png'

  const activeTab = ref('story')
  const openPanel = ref(0)

  const offerCards = [
    {
      icon: 'mdi-go-kart-track',
      title: 'Interactive Builder',
      text: 'Mix parts, explore combinations, and shape a kart setup that actually feels personal.',
    },
    {
      icon: 'mdi-storefront-outline',
      title: 'Parts Discovery',
      text: 'Browse engines, frames, brakes, and more in one focused space built for comparison.',
    },
    {
      icon: 'mdi-account-group-outline',
      title: 'Community Sharing',
      text: 'Post your progress, show off finished builds, and get inspiration from other racers.',
    },
    {
      icon: 'mdi-trophy-outline',
      title: 'Progress & XP',
      text: 'Reward participation so exploring, creating, and sharing all feel connected.',
    },
  ]

  const futureRoadmap = [
    {
      title: 'Smarter recommendations',
      text: 'Surface better part combinations and setup ideas based on category and build intent.',
    },
    {
      title: 'Deeper community tools',
      text: 'Make feedback, reactions, and shared build inspiration feel more immediate and useful.',
    },
    {
      title: 'A stronger race-day experience',
      text: 'Bring builders closer to events, progress tracking, and a bigger sense of momentum.',
    },
  ]

  const highlights = [
    {
      title: 'Everything in one flow',
      text: 'KartHub connects browsing, configuring, saving, and sharing so the experience feels like one continuous build journey.',
    },
    {
      title: 'Built for every level',
      text: 'Whether you are starting with a junior kart or refining a pro-level setup, the platform stays approachable and useful.',
    },
    {
      title: 'Designed to feel alive',
      text: 'We want every page to feel like the paddock: active, visual, and full of momentum rather than static and generic.',
    },
  ]

  const activeTabLabel = computed(() => {
    return {
      story: 'Origin',
      value: 'Platform Value',
      future: 'Roadmap',
    }[activeTab.value]
  })
</script>

<style scoped>
  .about-page {
    background:
      radial-gradient(circle at top right, rgba(255, 0, 0, 0.14), transparent 24%),
      radial-gradient(circle at bottom left, rgba(255, 120, 0, 0.1), transparent 20%),
      linear-gradient(180deg, rgba(0, 0, 0, 1), rgba(10, 10, 10, 1));
    min-height: calc(100vh - 64px);
  }

  /* Light mode backgrounds */
  [data-theme="light"] .about-page,
  .light-mode .about-page {
    background:
      radial-gradient(circle at top right, rgba(230, 57, 70, 0.06), transparent 24%),
      radial-gradient(circle at bottom left, rgba(230, 57, 70, 0.05), transparent 20%),
      linear-gradient(180deg, #F8F9FA, #F5F7FB);
  }

  .about-toolbar,
  .hero-card,
  .stat-card,
  .interactive-card,
  .mini-card {
    background: rgba(18, 18, 18, 0.9);
    backdrop-filter: blur(8px);
  }

  /* Light mode card backgrounds */
  [data-theme="light"] .about-toolbar,
  [data-theme="light"] .hero-card,
  [data-theme="light"] .stat-card,
  [data-theme="light"] .interactive-card,
  [data-theme="light"] .mini-card,
  .light-mode .about-toolbar,
  .light-mode .hero-card,
  .light-mode .stat-card,
  .light-mode .interactive-card,
  .light-mode .mini-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-color: rgba(230, 57, 70, 0.08);
  }

  .hero-image {
    position: relative;
  }

  .hero-overlay {
    align-items: flex-start;
    background: linear-gradient(180deg, rgba(8, 8, 8, 0.18), rgba(8, 8, 8, 0.7));
    color: white;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: flex-end;
    padding: 28px;
  }

  .hero-title {
    max-width: 620px;
  }

  .hero-copy {
    max-width: 560px;
  }
</style>
