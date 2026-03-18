import { onMounted } from 'vue'
import * as images from '../stores/imagePaths'

export function usePreloadImages() {
  onMounted(() => {
    Object.values(images).forEach((group) => {
      Object.values(group).forEach((src) => {
        if (src) {
          const img = new Image()
          img.src = src
        }
      })
    })
  })
}
