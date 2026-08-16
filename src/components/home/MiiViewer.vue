<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MiiImages } from '@/stores/imagePaths'
import { ALL_KEYS, resolveImages, gridKeyFromNormalized } from '@/composables/useMii'

const resolved = resolveImages(MiiImages)

const activeKey = ref('front')
const isHovering = ref(false)
const mouseX = ref(0.5)
const mouseY = ref(0.5)

const containerRef = ref(null)
const tiltX = computed(() => (mouseX.value - 0.5) * 8)
const tiltY = computed(() => (mouseY.value - 0.5) * -8)

const wrapperTransform = computed(() => {
  if (!isHovering.value) return 'rotateY(0deg) rotateX(0deg) scale(1)'
  return `rotateY(${tiltX.value}deg) rotateX(${tiltY.value}deg) scale(1.01)`
})

let frame = null
let pending = null

function apply() {
  frame = null
  const e = pending
  if (!e) return

  const rect = containerRef.value?.getBoundingClientRect()
  let x, y

  if (
    rect &&
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  ) {
    // inside container > precise
    x = (e.clientX - rect.left) / rect.width
    y = (e.clientY - rect.top) / rect.height
  } else {
    // outside container > coarse
    x = e.clientX / window.innerWidth
    y = e.clientY / window.innerHeight
  }

  x = Math.max(0, Math.min(1, x))
  y = Math.max(0, Math.min(1, y))

  activeKey.value = gridKeyFromNormalized(x, y)
  mouseX.value = x
  mouseY.value = y
  isHovering.value = true
}

function onMouseMove(e) {
  pending = { clientX: e.clientX, clientY: e.clientY }
  if (frame === null) frame = requestAnimationFrame(apply)
}

function onMouseLeave() {
  if (frame !== null) {
    cancelAnimationFrame(frame)
    frame = null
  }
  pending = null
  isHovering.value = false
  activeKey.value = 'front'
  mouseX.value = 0.5
  mouseY.value = 0.5
}

const isFinePointer = () => window.matchMedia?.('(pointer: fine)').matches ?? true

onMounted(() => {
  if (!isFinePointer()) return
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  document.documentElement.addEventListener('mouseleave', onMouseLeave)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  document.documentElement.removeEventListener('mouseleave', onMouseLeave)
  if (frame !== null) cancelAnimationFrame(frame)
})
</script>

<template>
  <div ref="containerRef" class="mii-container">
    <!-- ground shadow -->
    <div class="mii-shadow" :class="{ hovering: isHovering }" />

    <!-- perspective wrapper -->
    <div class="mii-wrapper" :style="{ transform: wrapperTransform }">
      <img
        v-for="key in ALL_KEYS"
        :key="key"
        :src="resolved[key].src"
        :alt="activeKey === key ? 'Mii facing ' + key : ''"
        :aria-hidden="activeKey === key ? undefined : 'true'"
        :class="{
          active: activeKey === key,
          flipped: resolved[key].flip,
          'has-hover': isHovering,
        }"
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
