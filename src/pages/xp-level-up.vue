<template>
  <!-- Level Up Banner (from sketch) -->
  <v-snackbar
    v-model="visible"
    color="primary"
    location="top"
    max-width="400"
    rounded="lg"
    :timeout="5000"
  >
    <div class="d-flex align-center gap-3">
      <v-icon size="32">mdi-arrow-up-circle</v-icon>
      <div>
        <div class="text-body-1 font-weight-bold">Level Up! 🎉</div>
        <div class="text-body-2">
          {{ message }}
        </div>
        <div v-if="giftCode" class="text-body-2 mt-1">
          Gift code: <strong>{{ giftCode }}</strong> (20% off your next order)
        </div>
      </div>
    </div>

    <template #actions>
      <v-btn icon="mdi-close" variant="text" @click="visible = false" />
    </template>
  </v-snackbar>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: 'Congratulations on your loyalty!',
    },
    giftCode: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const visible = ref(props.modelValue)

  watch(() => props.modelValue, val => {
    visible.value = val
  })
  watch(visible, val => {
    if (!val) emit('update:modelValue', false)
  })
</script>
