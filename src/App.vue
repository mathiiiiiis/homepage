<script setup>
import IconSprite from '@/components/icons/IconSprite.vue'
import ThemeToogle from '@/components/ThemeToggle.vue'
import { usePreloadImages } from '@/composables/usePreloadImages'
import { useTheme } from '@/composables/useTheme'
usePreloadImages()
useTheme()
</script>

<template>
  <IconSprite />
  <ThemeToogle />
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
