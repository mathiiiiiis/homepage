<script setup>
// icons = sprite id (see IconSprite.vue), color = tile background
const socials = [
  {
    name: 'GitHub',
    handle: 'mathiiiiiis',
    href: 'https://github.com/mathiiiiiis',
    icon: 'icon-github',
    color: '#2a2a2a',
  },
  {
    name: 'Discord',
    handle: '@mathhiiss',
    href: 'https://discord.com/users/1377301109827174660',
    icon: 'icon-discord',
    color: '#5865f2',
  },
  {
    name: 'TikTok',
    handle: '@mathis.ai',
    href: 'https://tiktok.com/@mathis.ai',
    icon: 'icon-tiktok',
    color: '#000000',
  },
  {
    name: 'Nerimity',
    handle: 'mathis:0000',
    href: 'https://nerimity.com/app/profile/1557301684324179969',
    icon: 'icon-nerimity',
    color: '#4c93ff',
  },
]

// 88x31 buttons
const webButtons = [
  {
    label: 'Sono on GitHub',
    src: '/images/webButtons/sono-github-appsono.gif',
    href: 'https://github.com/appsono',
  },
  {
    label: 'Powered by Debian',
    src: '/images/webButtons/powered-by-debian.gif',
    href: 'https://debian.org',
  },
  {
    label: 'Made with Neovim',
    src: '/images/webButtons/neovim.gif',
    href: 'https://neovim.io',
  },
  {
    label: 'Get Firefox',
    src: '/images/webButtons/firefox.gif',
    href: 'https://firefox.com/download',
  },
  {
    label: 'Anything but Chrome',
    src: '/images/webButtons/anythingbut.gif',
  },
  {
    label: 'Powered by Linux',
    src: '/images/webButtons/gnu-linux.gif',
  },
  {
    label: 'Linux today',
    src: '/images/webButtons/nclinux.gif',
    href: 'https://kernel.org',
  },
  {
    label: 'mathiiis.de animated',
    src: '/images/webButtons/mathiiis-de.gif',
    my: true,
  },
  {
    label: 'mathiiis.de static',
    src: '/images/webButtons/mathiiis-de-no-anim.gif',
    my: true,
  },
]

const otherButtons = webButtons.filter((b) => !b.my)
const myButtons = webButtons.filter((b) => b.my)
</script>

<template>
  <div class="socials-page">
    <header class="page-header">
      <router-link to="/" class="btn-back">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M16.88 2.88a1.25 1.25 0 0 0-1.77 0L6.7 11.29a.996.996 0 0 0 0 1.41l8.41 8.41c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.54 12l7.35-7.35c.48-.49.48-1.28-.01-1.77z" />
        </svg>
      </router-link>
      <h1 class="page-title">MY<span>SOCIALS</span></h1>
      <p class="page-subtitle">Where to find me</p>
    </header>

    <section class="socials-grid">
      <a v-for="social in socials" :key="social.name" :href="social.href" target="_blank" class="card social-tile">
        <div class="social-icon" :style="{ background: social.color }">
          <svg class="icon">
            <use :href="'#' + social.icon" />
          </svg>
        </div>
        <div class="social-text">
          <h3 class="social-name">{{ social.name }}</h3>
          <p class="social-handle">{{ social.handle }}</p>
        </div>
      </a>
    </section>

    <hr class="separator" />

    <section class="buttons-section">
      <h2 class="section-title">WEB<span>BUTTONS</span></h2>
      <div class="button-wall">
        <div class="wall-row">
          <a v-for="button in otherButtons" :key="button.label" :href="button.href" target="_blank" class="web-button">
            <img :src="button.src" :alt="button.label" />
          </a>
        </div>
        <div class="wall-row">
          <a v-for="button in myButtons" :key="button.label" :href="button.href" target="_blank" class="web-button">
            <img :src="button.src" :alt="button.label" />
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="css" scoped>
.socials-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
  min-height: 100dvh;
  padding: 64px 24px;
}

.card {
  background-color: var(--card-bg);
  border: solid 2px var(--card-border);
}

/* ==== HEADER ==== */
.page-header {
  text-align: center;
}

.page-title {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: 28px;
  text-transform: uppercase;
}

.page-title span {
  font-weight: 700;
  font-size: 38px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-family: var(--font-secondary);
  margin-top: 8px;
}

.btn-back {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--icon-bg);
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition:
    opacity var(--transition-fast),
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-back:hover {
  opacity: 0.85;
}

.btn-back:active {
  transform: scale(0.92);
  transition: transform 80ms ease-out;
}

.btn-back .icon {
  width: 22px;
  height: 22px;
}

/* ==== SOCIALS GRID ==== */
.socials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 616px;
}

.social-tile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 25px;
  text-decoration: none;
  color: var(--text-primary);
  transition:
    opacity var(--transition-fast),
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.social-tile:active {
  transform: scale(0.96);
  transition: transform 80ms ease-out;
}

.social-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.social-icon .icon {
  width: 32px;
  height: 32px;
}

.social-name {
  font-family: var(--font-primary);
  font-weight: 700;
  font-size: 18px;
}

.social-handle {
  font-family: var(--font-secondary);
  font-size: 13px;
  color: var(--text-secondary);
}

/* ==== SEPARATOR ==== */
.separator {
  width: 200px;
  border: none;
  border-top: 2px solid var(--card-border);
  margin: 16px 0;
}

/* ==== WEB BUTTONS ==== */
.buttons-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.section-title {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: 25px;
  text-transform: uppercase;
}

.section-title span {
  font-weight: 700;
  font-size: 31px;
}

.button-wall {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 22px;
  max-width: 480px;
}

.wall-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.web-button {
  width: 88px;
  height: 31px;
  display: block;
  box-sizing: content-box;
}



a.web-button {
  transition:
    opacity var(--transition-fast),
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

a.web-button:active {
  transform: scale(0.92);
  transition: transform 80ms ease-out;
}

@media (max-width: 620px) {
  .socials-page {
    padding: 64px 16px;
  }

  .socials-grid {
    grid-template-columns: 1fr;
    max-width: 450px;
  }
}
</style>
