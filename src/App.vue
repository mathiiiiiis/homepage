<script setup>
import { usePreloadImages } from '@/composables/usePreloadImages'
import IconSprite from './components/icons/IconSprite.vue'
usePreloadImages()
</script>

<template>
  <IconSprite />
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
