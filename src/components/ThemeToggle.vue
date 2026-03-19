<script setup>
import { useTheme } from '@/composables/useTheme'
const { theme, toggle } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    @click="toggle"
    :aria-label="'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode'"
  >
    <svg
      v-if="theme === 'dark'"
      class="toggle-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
    <svg
      v-else
      class="toggle-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>

<style lang="css" scoped>
.theme-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--card-border);
  background: var(--bg-solid);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition:
    opacity var(--transition-fast),
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-toggle:hover {
  opacity: 0.85;
}

.theme-toggle:active {
  transform: scale(0.92);
  transition: transform 80ms ease-out;
}

.toggle-icon {
  width: 22px;
  height: 22px;
}
</style>
