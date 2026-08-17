import { onMounted, onUnmounted } from 'vue'

// Touch counterpart to usePointerTarget

const HOLD_MS = 2200

export function useTouchTarget(containerRef, onTarget) {
  let el = null
  let rect = null
  let frame = null
  let pending = null
  let holdTimer = null
  let activeId = null

  function emit(clientX, clientY) {
    if (!rect || rect.width === 0) return
    onTarget(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -(((clientY - rect.top) / rect.height) * 2 - 1),
    )
  }

  function flush() {
    frame = null
    if (pending) emit(pending.x, pending.y)
  }

  function release() {
    activeId = null
    if (frame !== null) {
      cancelAnimationFrame(frame)
      frame = null
    }
    pending = null
  }

  function onDown(e) {
    if (e.pointerType === 'mouse') return
    clearTimeout(holdTimer)
    activeId = e.pointerId
    //read once per gesture
    rect = el.getBoundingClientRect()
    el.setPointerCapture?.(e.pointerId)
    pending = { x: e.clientX, y: e.clientY }
    flush()
  }

  function onMove(e) {
    if (e.pointerId !== activeId) return
    pending = { x: e.clientX, y: e.clientY }
    if (frame === null) frame = requestAnimationFrame(flush)
  }

  function onUp(e) {
    if (e.pointerId !== activeId) return
    release()
    //hold last look => ease back to neutral
    holdTimer = setTimeout(() => onTarget(0, 0), HOLD_MS)
  }

  onMounted(() => {
    el = containerRef?.value
    if (!el) return
    el.addEventListener('pointerdown', onDown, { passive: true })
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerup', onUp, { passive: true })
    el.addEventListener('pointercancel', onUp, { passive: true })
  })

  onUnmounted(() => {
    if (!el) return
    clearTimeout(holdTimer)
    release()
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onUp)
    el.removeEventListener('pointercancel', onUp)
  })
}
