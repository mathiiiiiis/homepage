import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: { title: 'Home' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/Projects.vue'),
      meta: { title: 'Projects' },
    },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Home'} - mathiiis.de`
})

export default router
