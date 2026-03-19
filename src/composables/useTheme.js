import { ref, watchEffect } from 'vue'

let theme

export function useTheme() {
  if (!theme) {
    theme = ref(localStorage.getItem('theme') || 'dark')
  }

  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem('theme', theme.value)
  })

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle }
}
