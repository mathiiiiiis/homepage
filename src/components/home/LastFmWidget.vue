<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const USERNAME = import.meta.env.VITE_LASTFM_USERNAME
const POLL_MS = 10000

const track = ref(null)
const isPlaying = ref(false)
const loading = ref(true)
const error = ref(false)
let interval = null

async function fetchTrack() {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`,
    )
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    const t = data.recenttracks?.track?.[0]
    if (!t) throw new Error('no tracks')

    isPlaying.value = !!t['@attr']?.nowplaying
    track.value = {
      name: t.name,
      artist: t.artist['#text'],
      album: t.album['#text'],
      image: t.image.find((i) => i.size === 'extralarge')?.['#text'] || '',
      url: t.url,
    }
    error.value = false
  } catch (e) {
    console.error('[LAST.FM] Fetch failed:', e)
    // keep the last good track on screen, only show the error if we never had one
    if (!track.value) error.value = true
  } finally {
    loading.value = false
  }
}

function startPolling() {
  if (interval === null) interval = setInterval(fetchTrack, POLL_MS)
}

function stopPolling() {
  clearInterval(interval)
  interval = null
}

function onVisibilityChange() {
  if (document.hidden) {
    stopPolling()
  } else {
    fetchTrack()
    startPolling()
  }
}

onMounted(() => {
  fetchTrack()
  startPolling()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <a v-if="track" :href="track.url" target="_blank" rel="noopener noreferrer" class="lastfm-link">
    <img
      :key="track.image"
      v-if="track.image"
      :src="track.image"
      class="lastfm-bg"
      alt=""
      draggable="false"
    />
    <div class="lastfm-overlay" />
    <div class="lastfm-content">
      <div class="lastfm-cover-wrapper">
        <img
          v-if="track.image"
          :src="track.image"
          :alt="track.album"
          class="lastfm-cover"
          draggable="false"
        />
        <div v-else class="lastfm-cover-fallback" />
      </div>
      <div class="lastfm-info">
        <span class="lastfm-label">{{ isPlaying ? 'Now Playing' : 'Last Played' }}</span>
        <span class="lastfm-title">{{ track.name }}</span>
        <span class="lastfm-artist">{{ track.artist }}</span>
      </div>
    </div>
  </a>
  <div v-else-if="loading" class="lastfm-skeleton" />
  <div v-else-if="error" class="lastfm-error">failed to load</div>
</template>

<style lang="css" scoped>
.lastfm-link {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;
  border-radius: inherit;
}

.lastfm-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px) brightness(1);
  transform: scale(1.25);
  z-index: 0;
}

.lastfm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(55, 50, 60, 0.55);
  z-index: 0;
}

.lastfm-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  padding: 16px 16px 16px 24px;
}

.lastfm-cover-wrapper {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: 15px 25px 25px 25px;
  overflow: hidden;
}

.lastfm-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lastfm-cover-fallback {
  width: 100%;
  height: 100%;
  background: var(--icon-bg);
}

.lastfm-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  font-family: var(--font-secondary);
  margin-top: 0px;
}

.lastfm-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.lastfm-title {
  font-family: var(--font-primary);
  font-weight: 600;
  font-size: 18px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.lastfm-artist {
  font-size: 18px;
  font-weight: 400;
  color: var(--text-secondary);
}

.lastfm-skeleton {
  width: 100%;
  height: 100%;
  background: var(--icon-bg);
  border-radius: inherit;
  animation: lastfm-pulse 1.5s ease-in-out infinite;
}

.lastfm-error {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 24px;
  font-family: var(--font-secondary);
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.5;
}

@keyframes lastfm-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lastfm-skeleton {
    animation: none;
  }
}
</style>
