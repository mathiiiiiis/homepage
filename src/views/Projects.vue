<script setup>
const featured = {
  title: 'Sono',
  description:
    'A local music player for a lot of devices (kinda). Built with Flutter. Development started in April 2025. Got restarted in March 2026.',
  tech: ['icon-flutter', 'icon-dart'],
  github: 'https://github.com/appsono/sono-new',
  website: 'https://play.google.com/store/apps/details?id=wtf.sono.app',
  images: ['/images/projects/sono-1.png'],
}

const projects = [
  {
    title: 'Blog but different',
    description: 'A live chat-style blog with real-time reactions and media support.',
    tech: ['icon-vue', 'icon-javascript', 'icon-python', 'icon-postgres', 'icon-docker'],
    github: 'https://github.com/mathiiiiiis/blog-but-different',
    website: 'https://blog.mathiiis.de',
    images: ['/images/projects/blog-1.png'],
  }
  {
    title: 'Global Chat Bot',
    description: 'Open-source Global Chat bot for Nerimity, with a real outbound queue so it survives the rate limits.',
    tech: ['icon-javascript'],
    github: 'https://github.com/mathiiiiiis/global-chat-bot',
    website: 'https://nerimity.com/bot/1778634213063569408?perms=2',
    images: ['/images/projects/nerimity-bot-1.png'],
  },
  {
    title: "Don't Click It",
    description: "A reflex game where a narrator tells you to click or not. Sometimes they lie. ",
    tech: ['icon-typescript', 'icon-docker'],
    github: 'https://github.com/mathiiiiiis/dont-click-it',
    website: 'https://dci.mathiiis.de',
    images: ['/images/projects/dont-click-it-1.png'],
  },
  {
    title: 'Homepage',
    description: 'This website. What did you expect?',
    tech: ['icon-vue', 'icon-javascript', 'icon-docker'],
    github: 'https://github.com/mathiiiiiis/homepage',
    website: 'https://mathiiis.de',
    images: ['/images/projects/homepage-1.png'],
  },
]
</script>

<template>
  <div class="projects-page">
    <header class="page-header">
      <router-link to="/" class="btn-back">
        <svg
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M16.88 2.88a1.25 1.25 0 0 0-1.77 0L6.7 11.29a.996.996 0 0 0 0 1.41l8.41 8.41c.49.49 1.28.49 1.77 0s.49-1.28 0-1.77L9.54 12l7.35-7.35c.48-.49.48-1.28-.01-1.77z"
          />
        </svg>
      </router-link>
      <h1 class="page-title">MY<span>PROJECTS</span></h1>
      <p class="page-subtitle">Things I've built and am working on.</p>
    </header>

    <section class="featured">
      <div class="featured-left">
        <div class="card featured-info">
          <div class="featured-top">
            <h2 class="project-title">{{ featured.title }}</h2>
            <p class="project-desc">{{ featured.description }}</p>
          </div>
          <div class="project-tech">
            <svg v-for="icon in featured.tech" :key="icon" class="tech-icon">
              <use :href="'#' + icon" />
            </svg>
          </div>
        </div>
        <div class="featured-buttons">
          <a :href="featured.website" target="_blank" class="btn-website">Website</a>
          <a :href="featured.github" target="_blank" class="btn-icon">
            <svg class="icon"><use href="#icon-github" /></svg>
          </a>
        </div>
      </div>
      <div class="featured-right">
        <div class="card featured-preview">
          <img
            v-if="featured.images.length"
            :src="featured.images[0]"
            :alt="featured.title"
            class="preview-img"
          />
        </div>
      </div>
    </section>

    <hr class="separator" />

    <section class="other-projects">
      <div
        v-for="(project, i) in projects"
        :key="project.title"
        class="project-item"
        :class="{ flip: i % 2 !== 0 }"
      >
        <div class="project-preview">
          <img
            v-if="project.images.length"
            :src="project.images[0]"
            :alt="project.title"
            class="preview-img"
          />
        </div>
        <div class="project-info">
          <div class="project-info-top">
            <h3 class="project-title">{{ project.title }}</h3>
            <p class="project-desc">{{ project.description }}</p>
          </div>
          <div class="project-info-bottom">
            <div class="project-tech">
              <svg v-for="icon in project.tech" :key="icon" class="tech-icon">
                <use :href="'#' + icon" />
              </svg>
            </div>
            <div class="project-buttons">
              <a v-if="project.website" :href="project.website" target="_blank" class="btn-website">
                Website
              </a>
              <a :href="project.github" target="_blank" class="btn-icon-sm">
                <svg class="icon"><use href="#icon-github" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="css" scoped>
.projects-page {
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
  box-sizing: border-box;
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

/* ==== FEATURED ==== */
.featured {
  display: flex;
  gap: 16px;
}

.featured-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 0;
}

.featured-right {
  padding-top: 48px;
}

.featured-info {
  width: 450px;
  height: 360px;
  border-radius: 25px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.featured-preview {
  width: 500px;
  height: 380px;
  border-radius: 25px;
  padding: 0;
  overflow: hidden;
}

.featured-top {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.featured-buttons {
  width: 450px;
  height: 70px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.separator {
  width: 200px;
  border: none;
  border-top: 2px solid var(--card-border);
  margin: 16px 0;
}

/* ==== OTHER PROJECTS ==== */
.other-projects {
  display: flex;
  flex-direction: column;
  gap: 64px;
  align-items: center;
  margin-top: 16px;
}

.project-item {
  position: relative;
  width: 800px;
  height: 380px;
}

.project-preview {
  width: 100%;
  height: 100%;
  border-radius: 25px;
  overflow: hidden;
  border: solid 2px var(--card-border);
}

.project-info {
  position: absolute;
  top: 50%;
  left: -60px;
  transform: translateY(-50%);
  width: 320px;
  border-radius: 25px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  z-index: 1;
  background-color: var(--bg-solid);
  border: solid 2px var(--card-border);
  box-sizing: border-box;
}

.project-item.flip .project-info {
  left: auto;
  right: -60px;
}

.project-info-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-info-bottom {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
}

/* ==== SHARED ==== */
.project-title {
  font-family: var(--font-primary);
}

.featured-info .project-title {
  font-size: 32px;
}

.project-desc {
  color: var(--text-secondary);
  font-family: var(--font-secondary);
  line-height: 1.6;
}

.project-tech {
  display: flex;
  gap: 8px;
  background: var(--icon-bg);
  padding: 8px 12px;
  border-radius: 16px;
  width: fit-content;
}

.tech-icon {
  width: 28px;
  height: 28px;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tech-icon:hover {
  transform: scale(1.15);
}

.featured-info .tech-icon {
  width: 32px;
  height: 32px;
}

.project-buttons {
  display: flex;
  gap: 8px;
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

.btn-website {
  flex: 1;
  height: 50px;
  border-radius: 25px;
  border: none;
  background: var(--button-primary);
  color: var(--button-text);
  font-family: var(--font-secondary);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.featured-buttons .btn-website {
  height: 100%;
}

.featured-buttons .btn-icon {
  width: 70px;
  height: 100%;
}

.btn-icon {
  width: 70px;
  height: 70px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
}

.btn-icon-sm {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
}

.btn-website,
.btn-icon,
.btn-icon-sm {
  cursor: pointer;
  transition:
    opacity var(--transition-fast),
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-website:hover,
.btn-icon:hover,
.btn-icon-sm:hover {
  opacity: 0.85;
}

.btn-website:active,
.btn-icon:active,
.btn-icon-sm:active {
  transform: scale(0.92);
  transition: transform 80ms ease-out;
}

.btn-icon .icon {
  width: 28px;
  height: 28px;
}

.btn-icon-sm .icon {
  width: 28px;
  height: 28px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ==== RESPONSIVE ==== */
@media (max-width: 1100px) {
  .featured {
    flex-direction: column;
    align-items: center;
  }

  .featured-right {
    padding-top: 0;
    width: 100%;
    max-width: 500px;
  }

  .featured-left {
    width: 100%;
    max-width: 500px;
  }

  .featured-info {
    width: 100%;
    height: auto;
    min-height: 300px;
    border-radius: 25px;
  }

  .featured-preview {
    width: 100%;
    height: 300px;
    border-radius: 25px;
  }

  .featured-buttons {
    width: 100%;
  }

  .project-item {
    width: 100%;
    max-width: 600px;
    height: auto;
    min-height: 340px;
  }

  .project-info {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    transform: none;
    width: calc(100% - 48px);
    margin: -40px auto 0 auto;
    min-height: 220px;
  }

  .project-item.flip .project-info {
    left: auto;
    right: auto;
    transform: none;
  }

  .project-preview {
    height: 300px;
  }
}

@media (max-width: 600px) {
  .projects-page {
    padding: 32px 16px;
    gap: 24px;
  }

  .featured-left,
  .featured-right {
    max-width: 100%;
  }

  .featured-info {
    padding: 20px;
    min-height: 260px;
  }

  .featured-info .project-title {
    font-size: 26px;
  }

  .featured-preview {
    height: 240px;
  }

  .featured-buttons {
    height: 60px;
  }

  .project-preview {
    height: 220px;
  }

  .project-info {
    width: calc(100% - 32px);
    padding: 20px;
  }
}
</style>
