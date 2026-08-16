<script setup>
import { ref, defineAsyncComponent } from 'vue'
import MiiSprite from './MiiSprite.vue'

//avoid loading three when WebGL isnt available
function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const use3d = ref(supportsWebGL())

const MiiModel = defineAsyncComponent({
  loader: () => import('./MiiModel.vue'),
  onError: () => {
    use3d.value = false
  },
})
</script>

<template>
  <MiiModel v-if="use3d" @fail="use3d = false" />
  <MiiSprite v-else />
</template>
