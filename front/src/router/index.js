import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/supabase/supabase';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../view/loginPage.vue')
    },
       {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../view/dashboardPage.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
      return { path: '/' }
    }
  }
})

export default router
