<template>
  <div class="design-preview-media" :style="{ height: `${height}px` }">
    <v-img
      v-if="design?.previewImage"
      :src="design.previewImage"
      :alt="design?.buildName || 'Kart preview'"
      class="design-preview-image"
      :style="framedLayerStyle"
      cover
    />
    <div v-else class="design-preview-fallback">
      <img
        :src="baseImage.src"
        :alt="baseImage.alt"
        class="design-preview-layer"
        :style="framedLayerStyle"
      />
      <img
        v-for="layer in layers"
        :key="layer.key"
        :src="layer.src"
        :alt="layer.alt"
        class="design-preview-layer"
        :style="getLayerStyle(layer)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PREVIEW_FRAMING, getDesignPreviewBaseImage, getDesignPreviewLayers } from '@/utils/designPreview'

const props = defineProps({
  design: {
    type: Object,
    default: null,
  },
  height: {
    type: Number,
    default: 140,
  },
})

const baseImage = computed(() =>
  getDesignPreviewBaseImage({
    parts: props.design?.parts,
    color: props.design?.color || null,
  }),
)

const layers = computed(() =>
  getDesignPreviewLayers({
    parts: props.design?.parts,
    color: props.design?.color || null,
  }),
)

const framedLayerStyle = computed(() => ({
  transform: `translate(${PREVIEW_FRAMING.offsetX * 100}%, ${PREVIEW_FRAMING.offsetY * 100}%) scale(${PREVIEW_FRAMING.scale})`,
  transformOrigin: 'center center',
}))

function getLayerStyle(layer) {
  return {
    ...framedLayerStyle.value,
    ...(layer.filter !== 'none' ? { filter: layer.filter } : {}),
  }
}
</script>

<style scoped>
.design-preview-media {
  position: relative;
  width: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.96), rgba(245, 245, 245, 0.92)),
    linear-gradient(135deg, rgba(255, 196, 0, 0.12), rgba(0, 0, 0, 0.04));
}

.design-preview-image,
.design-preview-fallback {
  width: 100%;
  height: 100%;
}

.design-preview-fallback {
  position: relative;
}

.design-preview-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  object-position: center;
}
</style>
