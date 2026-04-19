<template>
  <div>
    <div v-if="!part" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon class="mb-4 text-medium-emphasis" size="72">mdi-alert-circle-outline</v-icon>
        <div class="text-h6 mb-2">Part not found</div>
        <v-btn to="/parts" variant="outlined">Back to Parts</v-btn>
      </div>
    </div>

    <template v-else>
      <v-app-bar flat>
        <template #prepend>
          <v-btn icon="mdi-arrow-left" @click="$router.back()" />
        </template>
        <v-app-bar-title>Part Description</v-app-bar-title>
      </v-app-bar>

      <div>
        <v-toolbar elevation="1" height="84">
          <template #title>
            <h2 class="text-h4 font-weight-bold">{{ part.name }}</h2>
          </template>
        </v-toolbar>

        <div class="pa-4">
          <v-card class="mx-auto" max-width="900" variant="outlined">
            <v-img
              :alt="part.name"
              cover
              height="360"
              :src="part.image"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                  <v-icon color="medium-emphasis" size="40">mdi-image-outline</v-icon>
                </div>
              </template>
            </v-img>

            <v-card-text class="pa-6">
              <div class="d-flex align-center gap-2 mb-4">
                <v-chip size="small" variant="tonal">{{ capitalize(part.type) }}</v-chip>
                <v-chip :color="part.availability ? 'success' : 'error'" size="small" variant="tonal">
                  {{ part.availability ? 'In Stock' : 'Out of Stock' }}
                </v-chip>
              </div>

              <div class="text-h5 font-weight-bold mb-3">{{ part.name }}</div>
              <div class="text-body-1 mb-4">{{ part.description || 'No description available for this part yet.' }}</div>
              <div class="text-h6 font-weight-bold">${{ part.price.toFixed(2) }}</div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { getPartById } from '@/datamodel/part_1'

  const route = useRoute()

  const partId = computed(() => route.query.id)
  const part = computed(() => partId.value ? getPartById(partId.value) : null)

  function capitalize (str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
  }
</script>
