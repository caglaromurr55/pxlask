import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Home from './views/Home.vue';
import RingView from './views/RingView.vue';
import RewardsView from './views/RewardsView.vue';
import MyRewardsView from './views/MyRewardsView.vue';
import AdminPanel from './views/AdminPanel.vue';
import { store } from './store.js';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/ring', name: 'Ring', component: RingView, meta: { requiresAuth: true } },
  { path: '/rewards', name: 'Rewards', component: RewardsView, meta: { requiresAuth: true } },
  { path: '/my-rewards', name: 'MyRewards', component: MyRewardsView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.currentUser) {
    return next('/login');
  }
  if (to.meta.requiresAdmin && store.currentUser?.role !== 'admin') {
    return next('/');
  }
  next();
});

export default router;
