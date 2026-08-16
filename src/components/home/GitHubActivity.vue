<script setup>
import { ref, onMounted, nextTick } from 'vue'

const GITHUB_USERNAME = 'mathiiiiiis'

const weeks = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref(false)
const scroller = ref(null)
const selected = ref(null)

// keep grid pinned to latest week instead of January
function scrollToRecent() {
  const el = scroller.value
  if (el) el.scrollLeft = el.scrollWidth
}

function select(day) {
  selected.value = day
}

onMounted(async () => {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
    )
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    total.value = data.total?.lastYear ?? data.contributions.reduce((s, d) => s + d.count, 0)

    const days = data.contributions
    const grouped = []
    for (let i = 0; i < days.length; i += 7) {
      grouped.push(days.slice(i, i + 7))
    }
    weeks.value = grouped
    loading.value = false
    await nextTick()
    scrollToRecent()
  } catch (e) {
    console.error('[GitHub Activity] Fetch failed:', e)
    error.value = true
    loading.value = false
  }
})
</script>

<template>
  <div class="gh">
    <div class="gh-top">
      <h3 class="gh-title">GitHub<span>Activity</span></h3>
      <div class="gh-meta">
        <span v-if="!loading && !error" class="gh-count">
          <template v-if="selected">
            {{ selected.count }} contribution{{ selected.count !== 1 ? 's' : '' }} ·
            {{ selected.date }}
          </template>
          <template v-else> {{ total.toLocaleString() }} contributions (year) </template>
        </span>
        <div class="gh-legend">
          <div class="gh-legend-cell" data-level="0" />
          <div class="gh-legend-cell" data-level="1" />
          <div class="gh-legend-cell" data-level="2" />
          <div class="gh-legend-cell" data-level="3" />
          <div class="gh-legend-cell" data-level="4" />
        </div>
      </div>
    </div>

    <div v-if="loading" class="gh-scroll">
      <div class="gh-grid">
        <div v-for="w in 53" :key="w" class="gh-week">
          <div v-for="d in 7" :key="d" class="gh-cell gh-cell--skeleton" />
        </div>
      </div>
    </div>
    <div v-else-if="error" class="gh-error">failed to load</div>

    <div v-else class="gh-scroll-wrap">
      <div ref="scroller" class="gh-scroll">
        <div class="gh-grid">
          <div v-for="(week, wi) in weeks" :key="wi" class="gh-week">
            <button
              v-for="(day, di) in week"
              :key="di"
              type="button"
              class="gh-cell"
              :data-level="day.level"
              :title="`${day.count} contribution${day.count !== 1 ? 's' : ''} · ${day.date}`"
              :aria-label="`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${day.date}`"
              @click="select(day)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.gh {
  --cell-0: #242020;
  --cell-1: #4a4646;
  --cell-2: #737070;
  --cell-3: #a8a5a5;
  --cell-4: #ffffff;
  --cell-size: 12px;
  --cell-gap: 3px;
}

[data-theme='light'] .gh {
  --cell-0: #dedad8;
  --cell-1: #b8b4b2;
  --cell-2: #8a8685;
  --cell-3: #565252;
  --cell-4: #121212;
}

.gh {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 20px 24px 18px;
  box-sizing: border-box;
}

.gh-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.gh-title {
  font-family: var(--font-primary);
  font-weight: 300;
  font-size: 18px;
  color: var(--text-primary);
}

.gh-title span {
  font-weight: 700;
}

.gh-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gh-count {
  font-family: var(--font-secondary);
  font-size: 12px;
  color: var(--text-secondary);
}

.gh-legend {
  display: flex;
  gap: 3px;
  align-items: center;
}

.gh-legend-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border-radius: 2px;
  flex-shrink: 0;
}

.gh-legend-cell[data-level='0'] { background: var(--cell-0); }
.gh-legend-cell[data-level='1'] { background: var(--cell-1); }
.gh-legend-cell[data-level='2'] { background: var(--cell-2); }
.gh-legend-cell[data-level='3'] { background: var(--cell-3); }
.gh-legend-cell[data-level='4'] { background: var(--cell-4); }

.gh-scroll-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
}

.gh-scroll {
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.gh-scroll::-webkit-scrollbar {
  display: none;
}

.gh-grid {
  display: flex;
  gap: var(--cell-gap);
  width: max-content;
  height: 100%;
}

.gh-week {
  display: flex;
  flex-direction: column;
  gap: var(--cell-gap);
}

.gh-cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border-radius: 2px;
  border: none;
  padding: 0;
  flex-shrink: 0;
  transition:
    opacity 100ms ease,
    transform 100ms ease;
  cursor: pointer;
}

.gh-cell[data-level='0'] { background: var(--cell-0); }
.gh-cell[data-level='1'] { background: var(--cell-1); }
.gh-cell[data-level='2'] { background: var(--cell-2); }
.gh-cell[data-level='3'] { background: var(--cell-3); }
.gh-cell[data-level='4'] { background: var(--cell-4); }

.gh-cell:hover {
  transform: scale(1.25);
}

.gh-cell:focus-visible {
  outline: 2px solid var(--text-primary);
  outline-offset: 2px;
}

.gh-cell--skeleton {
  background: var(--cell-0);
  animation: gh-pulse 1.5s ease-in-out infinite;
}

.gh-week:nth-child(3n)   .gh-cell--skeleton { animation-delay: 0.2s; }
.gh-week:nth-child(3n+1) .gh-cell--skeleton { animation-delay: 0.4s; }

@keyframes gh-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

@media (prefers-reduced-motion: reduce) {
  .gh-cell--skeleton {
    animation: none;
  }

  .gh-cell {
    transition: none;
  }

  .gh-cell:hover {
    transform: none;
  }
}

.gh-error {
  flex: 1;
  display: flex;
  align-items: center;
  font-family: var(--font-secondary);
  font-size: 13px;
  color: var(--text-secondary);
  opacity: 0.5;
}

/* ==== MOBILE ==== */
@media (max-width: 820px) {
  .gh {
    gap: 6px;
    padding: 14px 24px 14px;
  }

  .gh-top {
    flex-wrap: wrap;
    gap: 4px 12px;
  }

  .gh-title {
    order: 1;
  }


  .gh-meta {
    display: contents;
  }

  .gh-legend {
    order: 2;
  }

  .gh-count {
    order: 3;
    flex-basis: 100%;
  }
}

@media (max-width: 500px) {
  .gh {
    padding: 14px 18px 14px;
  }

  .gh-title {
    font-size: 16px;
  }
}
</style>
