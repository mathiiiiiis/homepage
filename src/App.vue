<script setup>
import { usePreloadImages } from '@/composables/usePreloadImages';
import miiViewer from '@/components/MiiViewer.vue';
import MiiViewer from '@/components/MiiViewer.vue';
usePreloadImages()
</script>

<template>
  <MiiViewer />
</template>

<style scoped></style>
