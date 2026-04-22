<template>
  <v-layout>
    <v-main>
      <!-- Event Detail View -->
      <template v-if="selectedEvent">
        <v-toolbar elevation="1" height="84">
          <template #prepend>
            <v-btn icon="mdi-arrow-left" @click="selectedEvent = null" />
          </template>
          <template #title>
            <div>
              <h2 class="text-h5 font-weight-bold">{{ selectedEvent.title }}</h2>
              <div class="text-body-2 text-medium-emphasis">{{ selectedEvent.date }} · {{ selectedEvent.location }}</div>
            </div>
          </template>
        </v-toolbar>

        <div class="pa-4">
          <v-row>
            <!-- Hero Banner -->
            <v-col cols="12">
              <v-card variant="flat" color="primary" class="pa-6 rounded-xl mb-2" style="background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="white" size="56" class="me-4">
                    <v-icon color="primary" size="28">mdi-flag-checkered</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h5 font-weight-bold text-white">{{ selectedEvent.title }}</div>
                    <div class="text-body-2 text-white" style="opacity: 0.85">{{ selectedEvent.focus }}</div>
                  </div>
                </div>
                <div class="d-flex ga-2 flex-wrap">
                  <v-chip color="white" variant="tonal" prepend-icon="mdi-calendar" size="small">{{ selectedEvent.date }}</v-chip>
                  <v-chip color="white" variant="tonal" prepend-icon="mdi-map-marker" size="small">{{ selectedEvent.location }}</v-chip>
                  <v-chip color="white" variant="tonal" prepend-icon="mdi-account-group" size="small">{{ getEventAttendance(selectedEvent) }} attending</v-chip>
                </div>
              </v-card>
            </v-col>

            <!-- About -->
            <v-col cols="12" sm="8">
              <v-card variant="outlined" class="mb-3">
                <v-card-title class="text-body-1 font-weight-bold pt-4 px-4 pb-2">About this Event</v-card-title>
                <v-card-text>
                  <p class="text-body-2 mb-4">{{ selectedEvent.description }}</p>
                  <p class="text-body-2 text-medium-emphasis">
                    This event is open to all registered KartHub members. Arrive 30 minutes early for registration and
                    safety briefing. Helmets and racing gear are mandatory. Kart inspections will be conducted on-site.
                  </p>
                </v-card-text>
              </v-card>

              <!-- Schedule -->
              <v-card variant="outlined">
                <v-card-title class="text-body-1 font-weight-bold pt-4 px-4 pb-2">Schedule</v-card-title>
                <template v-if="selectedEvent.schedule && selectedEvent.schedule.length">
                  <v-list lines="two" density="compact">
                    <v-list-item
                      v-for="item in selectedEvent.schedule"
                      :key="item.time"
                      :prepend-icon="item.icon"
                      :title="item.label"
                      :subtitle="item.time"
                    />
                  </v-list>
                </template>
                <v-card-text v-else class="text-body-2 text-medium-emphasis">
                  No schedule available for this event yet.
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Sidebar -->
            <v-col cols="12" sm="4">
              <!-- Attendance -->
              <v-card variant="outlined" class="mb-3">
                <v-card-title class="text-body-1 font-weight-bold pt-4 px-4 pb-2">Attendance</v-card-title>
                <v-card-text>
                  <div class="d-flex justify-space-between mb-1">
                    <span class="text-body-2">{{ getEventAttendance(selectedEvent) }} racers going</span>
                    <span class="text-caption text-medium-emphasis">{{ selectedEvent.capacity }} max</span>
                  </div>
                  <v-progress-linear
                    color="primary"
                    height="8"
                    rounded
                    :model-value="(getEventAttendance(selectedEvent) / selectedEvent.capacity) * 100"
                    class="mb-4"
                  />
                  <v-btn
                    :color="isAttending(selectedEvent.id) ? 'success' : 'primary'"
                    block
                    :variant="isAttending(selectedEvent.id) ? 'tonal' : 'flat'"
                    :prepend-icon="isAttending(selectedEvent.id) ? 'mdi-check-circle' : 'mdi-plus-circle'"
                    @click="toggleAttend(selectedEvent.id)"
                  >
                    {{ isAttending(selectedEvent.id) ? 'Joined' : 'Join Event' }}
                  </v-btn>
                </v-card-text>
              </v-card>

              <!-- Location -->
              <v-card variant="outlined" class="mb-3">
                <v-card-title class="text-body-1 font-weight-bold pt-4 px-4 pb-2">Location</v-card-title>
                <v-card-text>
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-icon color="primary" size="18">mdi-map-marker</v-icon>
                    <span class="text-body-2 font-weight-medium">{{ selectedEvent.location }}</span>
                  </div>
                  <div
                    class="rounded-lg d-flex align-center justify-center"
                    style="height: 100px; background: rgba(var(--v-theme-primary), 0.08); border: 1px dashed rgba(var(--v-theme-primary), 0.3)"
                  >
                    <v-icon color="primary" size="32">mdi-map</v-icon>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Focus Tag -->
              <v-card variant="outlined">
                <v-card-text class="d-flex align-center ga-3">
                  <v-icon color="primary">mdi-tag-outline</v-icon>
                  <div>
                    <div class="text-caption text-medium-emphasis">Category</div>
                    <div class="text-body-2 font-weight-medium">{{ selectedEvent.focus }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </template>

      <!-- Events List View -->
      <template v-else>
        <v-toolbar elevation="1" height="84">
          <template #title>
            <div>
              <h2 class="text-h4 font-weight-bold">Events</h2>
              <div class="text-body-2 text-medium-emphasis">Join community races and meetups.</div>
            </div>
          </template>
          <template #append>
            <v-text-field
              v-model="searchTerm"
              clearable
              density="comfortable"
              hide-details
              placeholder="Search events..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              class="me-4"
              style="width: clamp(260px, 38vw, 640px)"
            />
          </template>
        </v-toolbar>

        <div class="pa-4">
          <v-row>
            <v-col v-for="event in filteredEvents" :key="event.id" cols="12" sm="6">
              <v-card variant="outlined">
                <v-card-item>
                  <template #prepend>
                    <v-avatar color="primary" variant="tonal">
                      <v-icon>mdi-calendar-star</v-icon>
                    </v-avatar>
                  </template>
                  <v-card-title>{{ event.title }}</v-card-title>
                  <v-card-subtitle>{{ event.date }} · {{ event.location }}</v-card-subtitle>
                </v-card-item>
                <v-card-text>
                  <div class="text-body-2 mb-4">{{ event.description }}</div>
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption text-medium-emphasis">{{ getEventAttendance(event) }} racers going</span>
                    <span class="text-caption text-medium-emphasis">{{ event.focus }}</span>
                  </div>
                  <v-progress-linear
                    color="primary"
                    height="8"
                    rounded
                    :model-value="(getEventAttendance(event) / event.capacity) * 100"
                  />
                </v-card-text>
                <v-card-actions class="justify-space-between">
                  <v-btn variant="text" size="small" prepend-icon="mdi-map-marker-outline" @click="selectedEvent = event">View Details</v-btn>
                  <v-btn
                    :color="isAttending(event.id) ? 'success' : 'primary'"
                    size="small"
                    variant="outlined"
                    @click="toggleAttend(event.id)"
                  >
                    {{ isAttending(event.id) ? 'Joined' : 'Join Event' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col v-if="filteredEvents.length === 0" cols="12">
              <v-alert variant="tonal" type="info">No events match this search yet.</v-alert>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-main>
  </v-layout>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { getAllEvents, isUserAttendingEvent, toggleEventAttendance } from '@/datamodel/event'

const store = useAppStore()
const router = useRouter()

const searchTerm = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const selectedEvent = ref(null)

const events = getAllEvents()
const currentUserEmail = computed(() => store.currentUser?.email || null)

const filteredEvents = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  if (!query) return events
  return events.filter(event =>
    `${event.title} ${event.description} ${event.location} ${event.focus}`.toLowerCase().includes(query),
  )
})

function toggleAttend(eventId) {
  if (!currentUserEmail.value) {
    snackbarText.value = 'Please sign in to join an event.'
    snackbar.value = true
    router.push('/login')
    return
  }

  const result = toggleEventAttendance(currentUserEmail.value, eventId)
  snackbarText.value = result.joined ? 'You joined the event.' : 'You left the event.'
  snackbar.value = true
}

function isAttending(eventId) {
  return isUserAttendingEvent(currentUserEmail.value, eventId)
}

function getEventAttendance(event) {
  return event.attendees
}
</script>
