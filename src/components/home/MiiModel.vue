<script setup>
import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { usePointerTarget, hasFinePointer } from '@/composables/usePointerTarget'
import { useTouchTarget } from '@/composables/useTouchTarget'

import MODEL_URL from '@/assets/models/mii.glb?url'
import POSES from '@/assets/poses.json'

const POKE_POSE = 'Pose.02'
const POKE_POSE_ALT = 'Pose.16'
const POKE_ALT_CHANCE = 0.25
const POSE_EXCLUDED = ['Pose.01', POKE_POSE, 'Pose.04', POKE_POSE_ALT]

import BLINK_URL from '@/assets/faces/blink.webp?url'
//import HALFLID_URL from '@/assets/faces/halflid.webp?url'
//import HAPPY_URL from '@/assets/faces/happy.webp?url'
import CLICK_URL from '@/assets/faces/click.webp?url'

const FACES = {
  blink: BLINK_URL,
  //halflid: HALFLID_URL,
  //happy: HAPPY_URL,
  click: CLICK_URL,
}

const emit = defineEmits(['fail', 'ready'])

const canvas = ref(null)
const wrapper = ref(null)
const loaded = ref(false)
const scene = shallowRef(null)

const { u, v } = usePointerTarget(wrapper)

let resizeObserver = null
let intersectionObserver = null

function onVisibilityChange() {
  scene.value?.setVisible(!document.hidden)
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
        scene.value?.loadPoses(POSES, POSE_EXCLUDED)
        scene.value?.loadFaces(FACES)
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
  wrapper.value.addEventListener('pointerdown', onPoke, { passive: true })

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

function onPoke(e) {
  const rect = wrapper.value?.getBoundingClientRect()
  if (!rect || rect.width === 0) return
  const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
  const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
  if (!scene.value?.hitTest(ndcX, ndcY)) return

  scene.value?.react(Math.random() < POKE_ALT_CHANCE ? POKE_POSE_ALT : POKE_POSE)
}

function onContextLost(e) {
  e.preventDefault()
  emit('fail')
}

if (hasFinePointer()) {
  watch([u, v], ([nu, nv]) => scene.value?.setLookTarget(nu * 2 - 1, -(nv * 2 - 1)))
}

useTouchTarget(wrapper, (ndcX, ndcY) => scene.value?.setLookTarget(ndcX, ndcY))

onUnmounted(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  canvas.value?.removeEventListener('webglcontextlost', onContextLost)
  wrapper.value?.removeEventListener('pointerdown', onPoke)
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
  touch-action: none;
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
