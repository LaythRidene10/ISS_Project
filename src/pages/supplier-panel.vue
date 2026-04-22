<template>
  <v-app-bar flat>
    <template #prepend>
      <v-btn icon="mdi-arrow-left" @click="$router.back()" />
    </template>

    <v-app-bar-title>Supplier Panel</v-app-bar-title>

    <v-spacer />

    <template #append>
      <v-chip color="primary" variant="tonal">Supplier</v-chip>
      <v-btn class="ms-2" icon to="/profile">
        <v-icon>mdi-account-circle</v-icon>
      </v-btn>
    </template>
  </v-app-bar>

  <div>
    <div v-if="!store.isLoggedIn" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon size="72">mdi-shield-lock-outline</v-icon>
        <div class="text-h6 mt-2">Please login</div>
        <v-btn to="/login" variant="outlined">Sign In</v-btn>
      </div>
    </div>

    <div v-else-if="store.currentUser?.type !== 'supplier'" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon size="72" color="error">mdi-alert-circle</v-icon>
        <div class="text-h6 mt-2">Access denied</div>
      </div>
    </div>

    <div v-else-if="!currentSupplier" class="d-flex align-center justify-center fill-height pa-8">
      <div class="text-center">
        <v-icon size="72" color="warning">mdi-store-alert-outline</v-icon>
        <div class="text-h6 mt-2">Supplier profile not found</div>
        <div class="text-body-2 text-medium-emphasis mt-2">
          This supplier account is not linked to a supplier record yet.
        </div>
      </div>
    </div>

    <template v-else>
      <div class="pa-4">
        <v-row class="mb-2">
          <v-col cols="12" md="3" sm="6">
            <v-card class="metric-card" variant="outlined">
              <v-card-text>
                <div class="text-caption text-medium-emphasis">Total Parts</div>
                <div class="text-h4 font-weight-bold">{{ supplierParts.length }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <v-card class="metric-card" variant="outlined">
              <v-card-text>
                <div class="text-caption text-medium-emphasis">In Stock</div>
                <div class="text-h4 font-weight-bold">{{ inStockCount }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <v-card class="metric-card" variant="outlined">
              <v-card-text>
                <div class="text-caption text-medium-emphasis">Orders</div>
                <div class="text-h4 font-weight-bold">{{ supplierOrders.length }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <v-card class="metric-card" variant="outlined">
              <v-card-text>
                <div class="text-caption text-medium-emphasis">Revenue</div>
                <div class="text-h4 font-weight-bold">${{ totalRevenue.toFixed(2) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mb-4" variant="outlined">
          <v-card-text class="d-flex flex-column flex-md-row gap-4 align-md-center">
            <div>
              <div class="text-overline">Supplier</div>
              <div class="text-h6">{{ currentSupplier.name }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ currentSupplier.email }}</div>
            </div>
            <v-spacer />
            <v-chip :color="currentSupplier.certified ? 'success' : 'warning'" variant="tonal">
              {{ currentSupplier.certified ? 'Verified Supplier' : 'Awaiting Verification' }}
            </v-chip>
          </v-card-text>
        </v-card>

        <v-tabs v-model="tab" color="primary" class="mb-4">
          <v-tab value="parts">
            <v-icon start>mdi-cog-outline</v-icon>
            My Parts
          </v-tab>

          <v-tab value="orders">
            <v-icon start>mdi-clipboard-list-outline</v-icon>
            Orders
          </v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="parts">
            <v-card variant="outlined">
              <v-card-text>
                <div class="d-flex flex-column flex-md-row gap-3 mb-4">
                  <v-text-field
                    v-model="partSearch"
                    clearable
                    density="compact"
                    hide-details
                    label="Search parts"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  />
                  <v-select
                    v-model="partTypeFilter"
                    clearable
                    density="compact"
                    hide-details
                    :items="PART_TYPES"
                    label="Filter by type"
                    variant="outlined"
                  />
                  <v-select
                    v-model="stockFilter"
                    density="compact"
                    hide-details
                    :items="stockOptions"
                    item-title="label"
                    item-value="value"
                    label="Stock"
                    variant="outlined"
                  />
                  <v-btn prepend-icon="mdi-plus" variant="outlined" @click="openAddPart">
                    Add Part
                  </v-btn>
                </div>

                <v-data-table
                  :headers="partHeaders"
                  :items="filteredParts"
                  item-value="ID"
                >
                  <template #item.type="{ item }">
                    <v-chip size="x-small" variant="tonal">
                      {{ capitalize(item.type) }}
                    </v-chip>
                  </template>

                  <template #item.price="{ item }">
                    ${{ Number(item.price || 0).toFixed(2) }}
                  </template>

                  <template #item.availability="{ item }">
                    <v-switch
                      :model-value="item.availability"
                      color="success"
                      density="compact"
                      hide-details
                      inset
                      @update:model-value="toggleAvailability(item, $event)"
                    />
                  </template>

                  <template #item.compatibility="{ item }">
                    <v-icon :color="item.compatibility ? 'success' : 'warning'" size="18">
                      {{ item.compatibility ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                    </v-icon>
                  </template>

                  <template #item.actions="{ item }">
                    <div class="d-flex gap-1">
                      <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEditPart(item)" />
                      <v-btn
                        icon="mdi-content-copy"
                        size="small"
                        variant="text"
                        @click="duplicatePart(item)"
                      />
                      <v-btn icon="mdi-delete-outline" size="small" color="error" variant="text" @click="deletePart(item)" />
                    </div>
                  </template>

                  <template #no-data>
                    <div class="text-center pa-6 text-medium-emphasis">
                      No parts match your current filters.
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="orders">
            <v-card variant="outlined">
              <v-card-text>
                <div class="d-flex flex-column flex-md-row gap-3 mb-4">
                  <v-text-field
                    v-model="orderSearch"
                    clearable
                    density="compact"
                    hide-details
                    label="Search orders"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                  />
                  <v-select
                    v-model="orderStatusFilter"
                    density="compact"
                    hide-details
                    :items="orderStatusOptions"
                    item-title="label"
                    item-value="value"
                    label="Status"
                    variant="outlined"
                  />
                </div>

                <v-data-table
                  :headers="orderHeaders"
                  :items="filteredOrders"
                  item-value="orderID"
                >
                  <template #item.userName="{ item }">
                    <div class="font-weight-medium">{{ item.userName }}</div>
                  </template>

                  <template #item.itemCount="{ item }">
                    {{ getSupplierItems(item).length }}
                  </template>

                  <template #item.price="{ item }">
                    ${{ Number(item.price || 0).toFixed(2) }}
                  </template>

                  <template #item.status="{ item }">
                    <v-chip
                      :color="item.status === 'complete' ? 'success' : 'warning'"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ capitalize(item.status) }}
                    </v-chip>
                  </template>

                  <template #item.actions="{ item }">
                    <div class="d-flex gap-1">
                      <v-btn size="small" variant="text" @click="openOrderDetails(item)">
                        View
                      </v-btn>
                      <v-btn
                        v-if="item.status !== 'complete'"
                        size="small"
                        variant="outlined"
                        @click="setOrderStatus(item, 'complete')"
                      >
                        Mark Complete
                      </v-btn>
                    </div>
                  </template>

                  <template #no-data>
                    <div class="text-center pa-6 text-medium-emphasis">
                      No orders match your current filters.
                    </div>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </div>
    </template>
  </div>

  <v-dialog v-model="partDialog" max-width="640">
    <v-card variant="outlined">
      <v-card-title>{{ editingPart ? 'Edit Part' : 'Add Part' }}</v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="7">
            <v-text-field
              v-model="partForm.name"
              class="mb-3"
              density="compact"
              label="Name"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="5">
            <v-select
              v-model="partForm.type"
              class="mb-3"
              density="compact"
              :items="PART_TYPES"
              label="Type"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="partForm.price"
              class="mb-3"
              density="compact"
              label="Price"
              prefix="$"
              type="number"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="partForm.image"
              class="mb-3"
              density="compact"
              label="Image URL or asset name"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="partForm.description"
              class="mb-3"
              density="compact"
              label="Description"
              rows="3"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <div class="d-flex flex-wrap gap-4">
          <v-checkbox
            v-model="partForm.availability"
            density="compact"
            hide-details
            label="In stock"
          />
          <v-checkbox
            v-model="partForm.compatibility"
            density="compact"
            hide-details
            label="Compatible"
          />
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="partDialog = false">Cancel</v-btn>
        <v-btn variant="outlined" @click="savePart">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="orderDialog" max-width="720">
    <v-card v-if="selectedOrder" variant="outlined">
      <v-card-title class="d-flex align-center">
        <span>Order {{ selectedOrder.orderID }}</span>
        <v-spacer />
        <v-chip :color="selectedOrder.status === 'complete' ? 'success' : 'warning'" variant="tonal">
          {{ capitalize(selectedOrder.status) }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <v-row class="mb-2">
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Customer</div>
            <div class="font-weight-medium">{{ selectedOrder.userName }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Delivery</div>
            <div class="font-weight-medium">{{ capitalize(selectedOrder.delivery) }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Payment</div>
            <div class="font-weight-medium">{{ selectedOrder.payment }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Total</div>
            <div class="font-weight-medium">${{ Number(selectedOrder.price || 0).toFixed(2) }}</div>
          </v-col>
        </v-row>

        <div class="text-subtitle-2 mb-2">Supplier Items</div>
        <v-list class="border rounded mb-4">
          <v-list-item
            v-for="item in getSupplierItems(selectedOrder)"
            :key="`${selectedOrder.orderID}-${item.id}`"
            :subtitle="`$${Number(item.price || 0).toFixed(2)}`"
            :title="item.name"
          />
        </v-list>

        <div class="text-subtitle-2 mb-2">Shipping Address</div>
        <div class="text-body-2 text-medium-emphasis">
          {{ formatAddress(selectedOrder.address) }}
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="text" @click="orderDialog = false">Close</v-btn>
        <v-spacer />
        <v-btn
          v-if="selectedOrder.status !== 'pending'"
          variant="text"
          @click="setOrderStatus(selectedOrder, 'pending')"
        >
          Mark Pending
        </v-btn>
        <v-btn
          v-if="selectedOrder.status !== 'complete'"
          variant="outlined"
          @click="setOrderStatus(selectedOrder, 'complete')"
        >
          Mark Complete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" timeout="2200">
    {{ snackbarText }}
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  Part,
  PART_TYPES,
  addPart,
  deletePartById,
  getAllParts,
  updatePartById,
} from '@/datamodel/part_1'
import { getAllOrders, updateOrderStatus } from '@/datamodel/order'
import { getSupplierByEmail } from '@/datamodel/supplier'

const store = useAppStore()

const tab = ref('parts')
const partDialog = ref(false)
const orderDialog = ref(false)
const editingPart = ref(null)
const selectedOrder = ref(null)
const partSearch = ref('')
const orderSearch = ref('')
const partTypeFilter = ref(null)
const stockFilter = ref('all')
const orderStatusFilter = ref('all')
const snackbar = ref(false)
const snackbarText = ref('')

const partForm = ref(createEmptyPartForm())

const stockOptions = [
  { label: 'All stock', value: 'all' },
  { label: 'In stock', value: 'in' },
  { label: 'Out of stock', value: 'out' },
]

const orderStatusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Complete', value: 'complete' },
]

const currentSupplier = computed(() =>
  getSupplierByEmail(store.currentUser?.email || '')
)

const supplierParts = computed(() =>
  getAllParts().filter(part => part.supplier === currentSupplier.value?.supplierID)
)

const supplierOrders = computed(() =>
  getAllOrders().filter(order =>
    getSupplierItems(order).length > 0
  )
)

const filteredParts = computed(() => {
  return supplierParts.value.filter(part => {
    const search = partSearch.value.trim().toLowerCase()
    const matchesSearch = !search || [
      part.name,
      part.type,
      part.description,
      part.serialNumber,
    ].some(value => String(value || '').toLowerCase().includes(search))

    const matchesType = !partTypeFilter.value || part.type === partTypeFilter.value
    const matchesStock =
      stockFilter.value === 'all' ||
      (stockFilter.value === 'in' && part.availability) ||
      (stockFilter.value === 'out' && !part.availability)

    return matchesSearch && matchesType && matchesStock
  })
})

const filteredOrders = computed(() => {
  return supplierOrders.value.filter(order => {
    const search = orderSearch.value.trim().toLowerCase()
    const matchesSearch = !search || [
      order.orderID,
      order.userName,
      order.delivery,
      order.payment,
    ].some(value => String(value || '').toLowerCase().includes(search))

    const matchesStatus =
      orderStatusFilter.value === 'all' ||
      order.status === orderStatusFilter.value

    return matchesSearch && matchesStatus
  })
})

const inStockCount = computed(() =>
  supplierParts.value.filter(part => part.availability).length
)

const totalRevenue = computed(() =>
  supplierOrders.value.reduce((sum, order) => {
    return sum + getSupplierItems(order).reduce((itemTotal, item) => itemTotal + Number(item.price || 0), 0)
  }, 0)
)

const partHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Price', key: 'price' },
  { title: 'In Stock', key: 'availability', sortable: false },
  { title: 'Compatible', key: 'compatibility' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const orderHeaders = [
  { title: 'Order ID', key: 'orderID' },
  { title: 'Customer', key: 'userName' },
  { title: 'Items', key: 'itemCount', sortable: false },
  { title: 'Total', key: 'price' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

function createEmptyPartForm () {
  return {
    name: '',
    price: 0,
    type: 'wheel',
    image: '',
    description: '',
    availability: true,
    compatibility: true,
  }
}

function openAddPart () {
  editingPart.value = null
  partForm.value = createEmptyPartForm()
  partDialog.value = true
}

function openEditPart (part) {
  editingPart.value = part
  partForm.value = {
    ...createEmptyPartForm(),
    ...part,
  }
  partDialog.value = true
}

function savePart () {
  if (!partForm.value.name || !currentSupplier.value) return

  if (editingPart.value) {
    updatePartById(editingPart.value.ID, {
      ...editingPart.value,
      ...partForm.value,
      supplier: currentSupplier.value.supplierID,
    })
    showSnackbar('Part updated.')
  } else {
    addPart(new Part({
      ...partForm.value,
      supplier: currentSupplier.value.supplierID,
    }))
    showSnackbar('Part added.')
  }

  partDialog.value = false
}

function duplicatePart (part) {
  if (!currentSupplier.value) return

  addPart(new Part({
    ...part,
    ID: undefined,
    name: `${part.name} Copy`,
    supplier: currentSupplier.value.supplierID,
  }))
  showSnackbar('Part duplicated.')
}

function deletePart (part) {
  deletePartById(part.ID)
  showSnackbar('Part deleted.')
}

function toggleAvailability (part, value) {
  updatePartById(part.ID, {
    ...part,
    availability: Boolean(value),
  })
  showSnackbar(Boolean(value) ? 'Part marked in stock.' : 'Part marked out of stock.')
}

function openOrderDetails (order) {
  selectedOrder.value = order
  orderDialog.value = true
}

function setOrderStatus (order, status) {
  updateOrderStatus(order.orderID, status)

  if (selectedOrder.value?.orderID === order.orderID) {
    selectedOrder.value = {
      ...selectedOrder.value,
      status,
    }
  }

  showSnackbar(`Order ${order.orderID} marked ${status}.`)
}

function getSupplierItems (order) {
  const supplierPartIds = new Set(supplierParts.value.map(part => part.ID))
  return (order.items || []).filter(item => supplierPartIds.has(item.id))
}

function formatAddress (address = {}) {
  return [
    address.country,
    address.region,
    address.city,
    address.state,
    address.zip,
    address.phone,
  ].filter(Boolean).join(', ') || 'No address available'
}

function showSnackbar (message) {
  snackbarText.value = message
  snackbar.value = true
}

function capitalize (str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}
</script>

<style scoped>
.metric-card {
  height: 100%;
}
</style>
