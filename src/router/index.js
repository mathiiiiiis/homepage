import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Home' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: { title: 'Projects' },
    },
    {
      path: '/socials',
      name: 'socials',
      component: () => import('@/views/SocialsView.vue'),
      meta: { title: 'Socials' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to, from, saved) {
    return saved || { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Home'} - mathiiis.de`
})

export default router
