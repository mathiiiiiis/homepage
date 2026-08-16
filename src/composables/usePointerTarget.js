import { ref, onMounted, onUnmounted } from 'vue'

// One shared listener for all consumers
// Coalesces mousemove into a single rAF

const x = ref(0.5)
const y = ref(0.5)
const active = ref(false)

let refCount = 0
let frame = null
let pending = null
let containerEl = null

function flush() {
  frame = null
  const e = pending
  if (!e) return

  const rect = containerEl?.getBoundingClientRect()
  let nx, ny

  if (
    rect &&
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  ) {
    // inside container > precise
    nx = (e.clientX - rect.left) / rect.width
    ny = (e.clientY - rect.top) / rect.height
  } else {
    // outside container > coarse
    nx = e.clientX / window.innerWidth
    ny = e.clientY / window.innerHeight
  }

  x.value = Math.max(0, Math.min(1, nx))
  y.value = Math.max(0, Math.min(1, ny))
  active.value = true
}

function onMove(e) {
  pending = { clientX: e.clientX, clientY: e.clientY }
  if (frame === null) frame = requestAnimationFrame(flush)
}

function onLeave() {
  if (frame !== null) {
    cancelAnimationFrame(frame)
    frame = null
  }
  pending = null
  x.value = 0.5
  y.value = 0.5
  active.value = false
}

//skip on touch devices
export function hasFinePointer() {
  return window.matchMedia?.('(pointer: fine)').matches ?? true
}

export function usePointerTarget(containerRef) {
  onMounted(() => {
    if (!hasFinePointer()) return
    containerEl = containerRef?.value ?? null
    if (refCount++ > 0) return
    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
  })

  onUnmounted(() => {
    if (!hasFinePointer()) return
    if (containerEl === (containerRef?.value ?? null)) containerEl = null
    if (--refCount > 0) return
    window.removeEventListener('mousemove', onMove)
    document.documentElement.removeEventListener('mouseleave', onLeave)
    onLeave()
  })

  return { x, y, active }
}
