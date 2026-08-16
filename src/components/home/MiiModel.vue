<script setup>
import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { usePointerTarget, hasFinePointer } from '@/composables/usePointerTarget'

import MODEL_URL from '@/assets/models/mii.glb?url'

const emit = defineEmits(['fail', 'ready'])

const canvas = ref(null)
const wrapper = ref(null)
const loaded = ref(false)
const scene = shallowRef(null)

const { x, y } = usePointerTarget(wrapper)

let resizeObserver = null
let intersectionObserver = null

function onVisibilityChange() {
  scene.value?.setVisibility(!document.hidden)
}

onMounted(async () => {
  let createMiiScene
  try {
    ;({ createMiiScene } = await import('@/composables/useMiiScene'))
  } catch (e) {
    console.error('[MII] three,js chunk failed:', e)
    emit('fail')
    return
  }

  try {
    scene.value = createMiiScene(canvas.value, {
      modeUrl: MODEL_URL,
      onReady: () => {
        loaded.value = true
        emit('ready')
      },
      onError: (e) => {
        console.error('[MII] model failed:', e)
        emit('fail')
      },
    })
  } catch (e) {
    console.error('[MII] chunk failed:', e)
    emit('fail')
    return
  }

  canvas.value.addEventListener('webglcontextlost', onContextLost, { passive: true })

  resizeObserver = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect
    scene.value?.resize(width, height)
  })
  resizeObserver.observe(wrapper.value)

  intersectionObserver = new IntersectionObserver(
    ([entry]) => scene.value?.setVisible(entry.isIntersecting && !document.hidden),
    { threshold: 0 },
  )
  intersectionObserver.observe(wrapper.value)

  document.addEventListener('visibilitychange', onVisibilityChange)
})

function onContextLost(e) {
  e.preventDefault()
  emit('fail')
}

if (hasFinePointer()) {
  watch([x, y], ([nx, ny]) => scene.value?.setLookTarget(nx, ny))
}

onUnmounted(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  canvas.value?.removeEventListener('webglcontextlost', onContextLost)
  scene.value?.dispose()
  scene.value = null
})
</script>

<template>
  <div ref="wrapper" class="mii-model">
    <canvas ref="canvas" class="mii-canvas" :class="{ loaded }" aria-hidden="true" />
    <div v-if="!loaded" class="mii-loading" />
    <span class="sr-only">3D render of mathis as a Mii character</span>
  </div>
</template>

<style lang="css" scoped>
.mii-model {
  position: relative;
  width: 100%;
  height: 100%;
}

.mii-canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity var(--transition-slow);
}

.mii-canvas.loaded {
  opacity: 1;
}

.mii-loading {
  position: absolute;
  inset: 25% 30%;
  border-radius: 25px;
  background: var(--icon-bg);
  animation: mii-pulse 1.5s ease-in-out infinite;
}

@keyframes mii-pulse {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.7;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .mii-canvas {
    transition: none;
  }

  .mii-loading {
    animation: none;
  }
}
</style>
