<script setup>
import { ref, onMounted } from 'vue'

const DISCORD_USER_ID = import.meta.env.VITE_DISCORD_USER_ID

const avatarUrl = ref(null)
const loading = ref(true)

onMounted (async () => {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
        const { data } = await res.json()
        const { id, avatar } = data.discord_user
        const ext = avatar.startsWith('a_') ? 'gif' : 'png'
        avatarUrl.value = `https://cdn.discordapp.com/avatars/${id}/${avatar}.${ext}?size=256`
    } catch (e) {
        console.error('[LANYARD] Fetch failed:', e)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="pfp-wrapper">
        <div v-if="loading" class="pfp-skeleton" />
        <img
            v-else-if="avatarUrl"
            :src="avatarUrl"
            alt="discord profile"
            class="pfp"
            draggable="false"
        />
        <div v-else class="pfp-fallback" />
    </div>
</template>

<style lang="css" scoped>
.pfp-wrapper {
    width: 115px;
    height: 115px;
    flex-shrink: 0;
}

.pfp,
.pfp-skeleton,
.pfp-fallback {
    width: 100%;
    height: 100%;
    border-radius: 15px 25px 15px 15px;
    object-fit: cover;
    transition: border-radius var(--transition-fast);
}

.pfp:hover,
.pfp-skeleton:hover,
.pfp-fallback:hover {
    border-radius: 15px 45px 25px 45px;
}

.pfp-skeleton {
    background: var(--icon-bg);
    animation: pulse 1.5s ease-in-out infinite;
}

.pfp-fallback {
    background: var(--icon-bg);
}

@keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
}
</style>
