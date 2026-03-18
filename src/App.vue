<script setup>
import { usePreloadImages } from '@/composables/usePreloadImages';
import IconSprite from './components/icons/IconSprite.vue';
usePreloadImages()
</script>

<template>
  <IconSprite />
  <router-view />
</template>
