<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const USERNAME = import.meta.env.VITE_LASTFM_USERNAME

const track = ref(null)
const isPlaying = ref(false)
const loading = ref(true)
let interval = null

async function fetchTrack() {
  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`,
    )
    const data = await res.json()
    const t = data.recenttracks.track[0]

    isPlaying.value = !!t['@attr']?.nowplaying
    track.value = {
      name: t.name,
      artist: t.artist['#text'],
      album: t.album['#text'],
      image: t.image.find((i) => i.size === 'extralarge')?.['#text'] || '',
      url: t.url,
    }
  } catch (e) {
    console.error('[LAST.FM] Fetch failed:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTrack()
  interval = setInterval(fetchTrack, 10000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <a v-if="track" :href="track.url" target="_blank" class="lastfm-link">
    <img v-if="track.image" :src="track.image" class="lastfm-bg" alt="" draggable="false" />
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
  filter: blur(20px) brightness(0.6) saturate(1.5);
  transform: scale(1.5);
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

.lastfm.skeleton {
  width: 100%;
  height: 100%;
  background: var(--icon-bg);
  border-radius: 16px;
}
</style>
