import { createRouter, createWebHistory } from 'vue-router'
import ControlView from './views/ControlView.vue'
import DisplayView from './views/DisplayView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/control' },
    { path: '/control', name: 'control', component: ControlView },
    { path: '/display', name: 'display', component: DisplayView },
  ],
})

// Expose the active route on <body> so global CSS can let the display route
// break out of the centered, max-width layout used by the control route.
router.afterEach((to) => {
  document.body.dataset.route = to.name || ''
})
