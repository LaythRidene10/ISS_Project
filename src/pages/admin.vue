<template>
  <v-app-bar flat>
    <template #prepend>
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
    </template>
    <v-app-bar-title>Admin Panel</v-app-bar-title>
    <v-spacer />
    <template #append>
      <v-chip class="ms-2" color="primary" variant="tonal">Admin</v-chip>
      
    </template>
  </v-app-bar>

  <div>
    <div v-if="!store.isLoggedIn" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon class="mb-4 text-medium-emphasis" size="72">mdi-shield-lock-outline</v-icon>
        <div class="text-h6 mb-2">Admin access required</div>
        <v-btn to="/login" variant="outlined">Sign In</v-btn>
      </div>
    </div>

    <template v-else>
      <v-toolbar elevation="1" height="84">
        <template #title>
          <h2 class="text-h4 font-weight-bold">Admin Panel</h2>
        </template>
      </v-toolbar>

      <div class="pa-4">
        <v-tabs v-model="tab" class="mb-4" color="primary">
          <v-tab value="parts">
            <v-icon start>mdi-cog-outline</v-icon>
            Parts
          </v-tab>
          <v-tab value="suppliers">
            <v-icon start>mdi-store-outline</v-icon>
            Suppliers
          </v-tab>
          <v-tab value="orders">
            <v-icon start>mdi-clipboard-list-outline</v-icon>
            Orders
          </v-tab>
          <v-tab value="users">
            <v-icon start>mdi-account-multiple-outline</v-icon>
            Users
          </v-tab>
          <v-tab value="events">
            <v-icon start>mdi-calendar-star</v-icon>
            Events
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">

          <!-- ══════════════ PARTS ══════════════ -->
          <v-window-item value="parts">
            <v-data-table class="border" :headers="partHeaders" item-value="ID" :items="parts">
              <template #item.type="{ item }">
                <v-chip size="x-small" variant="tonal">{{ capitalize(item.type) }}</v-chip>
              </template>
              <template #item.price="{ item }">
                ${{ item.price.toFixed(2) }}
              </template>
              <template #item.compatibility="{ item }">
                <v-icon :color="item.compatibility ? 'success' : 'warning'" size="18">
                  {{ item.compatibility ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                </v-icon>
              </template>
              <template #item.availability="{ item }">
                <v-chip :color="item.availability ? 'success' : 'error'" size="x-small" variant="tonal">
                  {{ item.availability ? 'In Stock' : 'Out of Stock' }}
                </v-chip>
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEditPart(item)" />
                  <v-btn color="error" icon="mdi-delete-outline" size="small" variant="text" @click="deletePart(item)" />
                </div>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- ══════════════ SUPPLIERS ══════════════ -->
          <v-window-item value="suppliers">
            <v-data-table class="border" :headers="supplierHeaders" item-value="supplierID" :items="suppliers">
              <template #item.certified="{ item }">
                <v-btn
                  :color="item.certified ? 'success' : 'warning'"
                  size="x-small"
                  :variant="item.certified ? 'tonal' : 'outlined'"
                  @click="toggleSupplierStatus(item)"
                >
                  {{ item.certified ? 'Verified' : 'Not Verified' }}
                </v-btn>
              </template>
              <template #item.actions="{ item }">
                <v-btn color="error" icon="mdi-delete-outline" size="small" variant="text" @click="removeSupplier(item)" />
              </template>
            </v-data-table>
          </v-window-item>

          <!-- ══════════════ ORDERS ══════════════ -->
          <v-window-item value="orders">
            <v-data-table class="border" :headers="orderHeaders" item-value="orderID" :items="orders">
              <template #item.price="{ item }">
                ${{ item.price.toFixed(2) }}
              </template>
              <template #item.status="{ item }">
                <v-chip
                  :color="completedOrders.has(item.orderID) || item.status === 'complete' ? 'success' : 'warning'"
                  size="x-small"
                  variant="tonal"
                >
                  {{ completedOrders.has(item.orderID) || item.status === 'complete' ? 'complete' : item.status }}
                </v-chip>
              </template>
              <template #no-data>
                <div class="text-center pa-6 text-medium-emphasis">No orders yet.</div>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- ══════════════ USERS ══════════════ -->
          <v-window-item value="users">
            <v-data-table class="border" :headers="userHeaders" item-value="email" :items="users">
              <template #no-data>
                <div class="text-center pa-6 text-medium-emphasis">No registered users.</div>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- ══════════════ EVENTS ══════════════ -->
          <v-window-item value="events">
            <div class="d-flex justify-end mb-4">
              <v-btn class="text-none" prepend-icon="mdi-plus" variant="outlined" @click="openAddEvent">
                Add Event
              </v-btn>
            </div>
            <v-data-table class="border" :headers="eventHeaders" item-value="id" :items="events">
              <template #item.spots="{ item }">
                {{ item.attendees }} / {{ item.capacity }}
              </template>
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEditEvent(item)" />
                  <v-btn color="error" icon="mdi-delete-outline" size="small" variant="text" @click="removeEvent(item)" />
                </div>
              </template>
            </v-data-table>
          </v-window-item>

        </v-window>
      </div>
    </template>
  </div>

  <!-- ── Add/Edit Part Dialog ── -->
  <v-dialog v-model="partDialog" max-width="520">
    <v-card variant="outlined">
      <v-card-title>{{ editingPart ? 'Edit Part' : 'Add New Part' }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="partForm.name" class="mb-3" density="compact" label="Part Name" variant="outlined" />
        <v-select v-model="partForm.type" class="mb-3" density="compact" :items="PART_TYPES" label="Type" variant="outlined" />
        <v-text-field v-model.number="partForm.price" class="mb-3" density="compact" label="Price" prefix="$" type="number" variant="outlined" />
        <v-textarea v-model="partForm.description" class="mb-3" density="compact" label="Description" rows="2" variant="outlined" />
        <v-select
          v-model="partForm.supplier"
          class="mb-3"
          clearable
          density="compact"
          item-title="name"
          item-value="supplierID"
          :items="suppliers"
          label="Supplier"
          variant="outlined"
        />
        <div class="d-flex gap-4">
          <v-checkbox v-model="partForm.compatibility" density="compact" hide-details label="Compatible" />
          <v-checkbox v-model="partForm.availability" density="compact" hide-details label="In Stock" />
        </div>
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="partDialog = false">Cancel</v-btn>
        <v-btn variant="outlined" @click="savePart">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Add Supplier Dialog ── -->

  <!-- ── Add/Edit Event Dialog ── -->
  <v-dialog v-model="eventDialog" max-width="520">
    <v-card variant="outlined">
      <v-card-title>{{ editingEvent ? 'Edit Event' : 'Add Event' }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="eventForm.title"       class="mb-3" density="compact" label="Title"            variant="outlined" />
        <v-text-field v-model="eventForm.date"        class="mb-3" density="compact" label="Date"             variant="outlined" placeholder="e.g. May 10" />
        <v-text-field v-model="eventForm.location"    class="mb-3" density="compact" label="Location"         variant="outlined" />
        <v-text-field v-model="eventForm.focus"       class="mb-3" density="compact" label="Category / Focus" variant="outlined" />
        <v-text-field v-model.number="eventForm.capacity" class="mb-3" density="compact" label="Capacity" type="number" variant="outlined" />
        <v-textarea   v-model="eventForm.description" density="compact" label="Description" rows="2" variant="outlined" />
      </v-card-text>
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="eventDialog = false">Cancel</v-btn>
        <v-btn variant="outlined" @click="saveEvent">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" timeout="2000">{{ snackbarText }}</v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getAllOrders, updateOrderStatus } from '@/datamodel/order'
import { addPart, deletePartById, getAllParts, Part, PART_TYPES, updatePartById } from '@/datamodel/part_1'
import { deleteSupplierById, getAllSuppliers, updateSupplierById } from '@/datamodel/supplier'
import { getAllUsers } from '@/datamodel/user'
import { addEvent, deleteEventById, getAllEvents, Event, updateEventById } from '@/datamodel/event'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const tab = ref('parts')
const supplierVersion = ref(0)

/* ── Reactive Data Feeds ── */
const parts     = computed(() => getAllParts())
const suppliers = computed(() => {
  supplierVersion.value
  return getAllSuppliers()
})
const orders    = computed(() => getAllOrders())
const users     = computed(() => getAllUsers())
const events    = getAllEvents()

/* ── Completed Orders ── */
const completedOrders = ref(new Set())

function markComplete(orderID) {
  updateOrderStatus(orderID, 'complete')
  completedOrders.value = new Set([...completedOrders.value, orderID])
}

/* ── Table Headers ── */
const partHeaders = [
  { title: 'Name',        key: 'name' },
  { title: 'Type',        key: 'type' },
  { title: 'Price',       key: 'price' },
  { title: 'Serial',      key: 'serialNumber' },
  { title: 'Compatible',  key: 'compatibility' },
  { title: 'Availability',key: 'availability' },
  { title: 'Actions',     key: 'actions', sortable: false },
]

const supplierHeaders = [
  { title: 'Name',    key: 'name' },
  { title: 'Email',   key: 'email' },
  { title: 'Status',  key: 'certified' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const orderHeaders = [
  { title: 'Order ID', key: 'orderID' },
  { title: 'User',     key: 'userName' },
  { title: 'Total',    key: 'price' },
  { title: 'Delivery', key: 'delivery' },
  { title: 'Payment',  key: 'payment' },
  { title: 'Status',   key: 'status' },
]

const userHeaders = [
  { title: 'First Name', key: 'first_name' },
  { title: 'Last Name',  key: 'last_name' },
  { title: 'Email',      key: 'email' },
]

const eventHeaders = [
  { title: 'Title',    key: 'title' },
  { title: 'Date',     key: 'date' },
  { title: 'Location', key: 'location' },
  { title: 'Category', key: 'focus' },
  { title: 'Spots',    key: 'spots', sortable: false },
  { title: 'Actions',  key: 'actions', sortable: false },
]

/* ── Part Dialog ── */
const partDialog  = ref(false)
const editingPart = ref(null)
const partForm    = ref({ name: '', type: 'wheel', price: 0, description: '', supplier: null, compatibility: true, availability: true })

function openAddPart() {
  editingPart.value = null
  partForm.value = { name: '', type: 'wheel', price: 0, description: '', supplier: null, compatibility: true, availability: true }
  partDialog.value = true
}

function openEditPart(part) {
  editingPart.value = part
  partForm.value = { ...part }
  partDialog.value = true
}

function savePart() {
  if (!partForm.value.name) return
  if (editingPart.value) {
    updatePartById(editingPart.value.ID, partForm.value)
  } else {
    addPart(new Part(partForm.value))
  }
  partDialog.value = false
  snackbarText.value = editingPart.value ? 'Part updated.' : 'Part added.'
  snackbar.value = true
}

function deletePart(part) {
  deletePartById(part.ID)
  snackbarText.value = 'Part deleted.'
  snackbar.value = true
}

/* ── Supplier Dialog ── */
function refreshSuppliers() {
  supplierVersion.value += 1
}

function toggleSupplierStatus(supplier) {
  updateSupplierById(supplier.supplierID, { certified: !supplier.certified })
  refreshSuppliers()
  snackbarText.value = `Supplier marked as ${supplier.certified ? 'not verified' : 'verified'}.`
  snackbar.value = true
}

function removeSupplier(supplier) {
  deleteSupplierById(supplier.supplierID)
  refreshSuppliers()
  snackbarText.value = 'Supplier deleted.'
  snackbar.value = true
}

/* ── Event Dialog ── */
const eventDialog  = ref(false)
const editingEvent = ref(null)
const eventForm    = ref({ title: '', date: '', location: '', focus: '', capacity: 50, description: '' })

function openAddEvent() {
  editingEvent.value = null
  eventForm.value = { title: '', date: '', location: '', focus: '', capacity: 50, description: '' }
  eventDialog.value = true
}

function openEditEvent(event) {
  editingEvent.value = event
  eventForm.value = { ...event }
  eventDialog.value = true
}

function saveEvent() {
  if (!eventForm.value.title) return
  if (editingEvent.value) {
    updateEventById(editingEvent.value.id, eventForm.value)
  } else {
    addEvent(new Event(eventForm.value))
  }
  eventDialog.value = false
  snackbarText.value = editingEvent.value ? 'Event updated.' : 'Event added.'
  snackbar.value = true
}

function removeEvent(event) {
  deleteEventById(event.id)
  snackbarText.value = 'Event deleted.'
  snackbar.value = true
}

/* ── Util ── */
const snackbar     = ref(false)
const snackbarText = ref('')

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}
</script>
