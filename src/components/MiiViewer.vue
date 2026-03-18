<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MiiImages } from '@/stores/imagePaths';

const MIRROR_FALLBACKS = {
    upRight: { src: 'upLeft', flip: true },
    right: { src: 'left', flip: true},
    downLeft: { src: 'downRight', flip: true },
    down: { src: 'front', flip: false},
}
const ALL_KEYS = ['upLeft', 'up', 'upRight', 'left', 'front', 'right', 'downLeft', 'down', 'downRight']
const GRID = [
    ['upLeft', 'up', 'upRight'],
    ['left', 'front', 'right'],
    ['downLeft', 'down', 'downRight'],
]
//resolve all images, uses a mirror fallback if missing
const resolved = {}
ALL_KEYS.forEach((key) => {
    if (MiiImages[key]) {
        resolved[key] = { src: MiiImages[key], flip: false }
    } else {
        const fb = MIRROR_FALLBACKS[key]
        if (fb && MiiImages[fb.src]) {
            resolved[key] = { src: MiiImages[fb.src], flip: fb.flip }
        } else {
            resolved[key] = { src: MiiImages.front, flip: false }
        }
    }
})

const activeKey = ref('front')
const isHovering = ref(false)
const mouseX = ref(0.5)
const mouseY = ref(0.5)

const containerRef = ref(null)
const tiltX = computed(() => (mouseX.value - 0.5) * 8)
const tiltY = computed(() => (mouseY.value - 0.5) * -8)

const wrapperTransform = computed(() => {
    if (!isHovering.value) return 'rotateY(0deg) rotateX(0deg) scale(1)'
    return `rotateY(${tiltX.value}deg) rotateX(${tiltY.value}deg) scale(1.01)`
})

function onMouseMove(e) {
    const el = containerRef.value
    const rect = el.getBoundingClientRect()
    let x, y

    if (rect && e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
        //inside container > precise
        x = (e.clientX - rect.left) / rect.width
        y = (e.clientY - rect.top) / rect.height
    } else {
        //outside container > coarse
        x = e.clientX / window.innerWidth
        y = e.clientY / window.innerHeight
    }

    x = Math.max(0, Math.min(1, x))
    y = Math.max(0, Math.min(1, y))

    const col = x < 0.33 ? 0 : x < 0.66 ? 1 : 2
    const row = y < 0.33 ? 0 : y < 0.66 ? 1 : 2

    activeKey.value = GRID[row][col]
    mouseX.value = x
    mouseY.value = y
    isHovering.value = true
}

function onMouseLeave() {
    isHovering.value = false
    activeKey.value = 'front'
    mouseX.value = 0.5
    mouseY.value = 0.5
}

onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
})

onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    document.documentElement.removeEventListener('mouseleave', onMouseLeave)
})
</script>

<template>
    <div
        ref="containerRef"
        class="mii-container"
    >
        <!-- ground shadow -->
         <div
            class="mii-shadow"
            :class="{ hovering: isHovering }"
         />

         <!-- perspective wrapper -->
          <div
            class="mii-wrapper"
            :style="{ transform: wrapperTransform }"
          >
            <img
                v-for="key in ALL_KEYS"
                :key="key"
                :src="resolved[key].src"
                :class="{
                    active: activeKey === key,
                    flipped: resolved[key].flip,
                    'has-hiver': isHovering,
                }"
                class="mii-image"
                alt=""
                draggable="false"
            />
        </div>
    </div>
</template>

<style lang="css" scoped>
.mii-container {
    width: 340px;
    height: 420px;
    cursor: pointer;
    perspective: 800px;
    position: relative;
}
.mii-shadow {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%) scale(1);
    width: 120px;
    height: 20px;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%);
    transition: transform 0.4s ease;
    z-index: 0;
}
.mii-shadow.hovering {
    transform: translate(-50%) scale(1.05);
}
.mii-wrapper {
    width: 100%;
    height: 100%;
    transition: transform 0.25s ease-out;
    transform-style: preserve-3d;
    position: relative;
    /*background: #000;*/
}
.mii-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    opacity: 0;
    user-select: none;
    pointer-events: none;
}
.mii-image.active {
    opacity: 1;
}
.mii-image.flipped {
    transform: scaleX(-1);
}
</style>