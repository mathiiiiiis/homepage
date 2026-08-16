<script setup>
import IconSprite from '@/components/icons/IconSprite.vue'
import ThemeToogle from '@/components/ThemeToggle.vue'
import { useTheme } from '@/composables/useTheme'
useTheme()
</script>

<template>
  <IconSprite />
  <ThemeToogle />
  <main>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>
