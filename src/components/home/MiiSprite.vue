<script setup>
import { ref, computed, watch } from 'vue'
import { MiiImages } from '@/stores/imagePaths'
import { ALL_KEYS, resolveImages, gridKeyFromNormalized } from '@/composables/useMii'
import { usePointerTarget, hasFinePointer } from '@/composables/usePointerTarget'
import { usePreloadImages } from '@/composables/usePreloadImages'

usePreloadImages()

const resolved = resolveImages(MiiImages)

const containerRef = ref(null)
const activeKey = ref('front')
const { x, y, active } = usePointerTarget(containerRef)

const tiltX = computed(() => (x.value - 0.5) * 8)
const tiltY = computed(() => (y.value - 0.5) * -8)

const wrapperTransform = computed(() =>
  active.value
    ? `rotateY(${tiltX.value}deg) rotateX(${tiltY.value}deg) scale(1.01)`
    : 'rotateY(0deg) rotateX(0deg) scale(1)',
)

if (hasFinePointer()) {
  watch([x, y, active], ([nx, ny, on]) => {
    activeKey.value = on ? gridKeyFromNormalized(nx, ny) : 'front'
  })
}
</script>

<template>
  <div ref="containerRef" class="mii-container">
    <!-- ground shadow -->
    <div class="mii-shadow" :class="{ hovering: active }" />

    <!-- perspective wrapper -->
    <div class="mii-wrapper" :style="{ transform: wrapperTransform }">
      <img
        v-for="key in ALL_KEYS"
        :key="key"
        :src="resolved[key].src"
        :alt="activeKey === key ? 'mathis as a Mii character, facing ' + key : ''"
        :aria-hidden="activeKey === key ? undefined : 'true'"
        :class="{ active: activeKey === key, flipped: resolved[key].flip }"
        class="mii-image"
        draggable="false"
      />
    </div>
  </div>
</template>

<style lang="css" scoped>
.mii-container {
  width: 340px;
  height: 420px;
  max-width: 100%;
  cursor: pointer;
  perspective: 800px;
  position: relative;
}
.mii-shadow {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%) scale(1);
  width: 120px;
  height: 20px;
  border-radius: 50%;
  transition: transform 0.4s ease;
  z-index: 0;
}
.mii-shadow.hovering {
  transform: translate(-50%) scale(1.05);
}
.mii-wrapper {
  width: 100%;
  height: 100%;
  transition: transform 0.25s ease-out;
  transform-style: preserve-3d;
  position: relative;
}
.mii-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  user-select: none;
  pointer-events: none;
}
.mii-image.active {
  opacity: 1;
}
.mii-image.flipped {
  transform: scaleX(-1);
}

@media (prefers-reduced-motion: reduce) {
  .mii-wrapper,
  .mii-shadow {
    transition: none;
  }
}
</style>
