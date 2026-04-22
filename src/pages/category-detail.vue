<template>
  <div>
    <div v-if="!category" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon class="mb-4 text-medium-emphasis" size="72">mdi-alert-circle-outline</v-icon>
        <div class="text-h6 mb-2">Category not found</div>
        <v-btn to="/categories" variant="outlined">Back to Categories</v-btn>
      </div>
    </div>

    <template v-else>
      <v-toolbar elevation="1" height="84">
        <template #prepend>
          <v-btn icon="mdi-arrow-left" @click="router.back()" />
        </template>
        <template #title>
          <h2 class="text-h4 font-weight-bold">{{ category.name }}</h2>
        </template>
      </v-toolbar>

      <div class="pa-4">
        <v-card class="mx-auto" max-width="1050" variant="outlined">
          <v-row class="ma-0">
            <v-col cols="12" md="6">
              <v-img
                :alt="category.name"
                cover
                height="100%"
                min-height="320"
                :src="category.image"
              >
                <template #placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                    <v-icon color="medium-emphasis" size="42">mdi-image-outline</v-icon>
                  </div>
                </template>
              </v-img>
            </v-col>

            <v-col class="d-flex align-center" cols="12" md="6">
              <v-card-text class="pa-6 pa-md-8">
                <v-chip class="mb-4" color="primary" variant="tonal">
                  {{ category.configuration }}
                </v-chip>

                <div class="text-h4 font-weight-bold mb-4">{{ category.name }}</div>
                <p class="text-body-1 mb-6">{{ category.description }}</p>

                <v-btn
                  append-icon="mdi-arrow-right"
                  color="primary"
                  variant="elevated"
                  @click="startBuilding"
                >
                  Start Building
                </v-btn>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getCategoryBySlug } from '@/datamodel/categories'

  const route = useRoute()
  const router = useRouter()

  const category = computed(() => getCategoryBySlug(route.query.slug))

  function startBuilding () {
    if (!category.value) {
      return
    }

    router.push({
      path: '/builder',
      query: { type: category.value.name },
    })
  }
</script>
