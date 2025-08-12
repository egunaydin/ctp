import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
    },
    {
        path: '/tracking',
        name: 'Tracking',
        component: () => import('@/views/Tracking.vue')
    },
    {
  path: '/settings',
  name: 'settings',
  component: () => import('@/views/Settings.vue'),
    },
    {
        path: '/invoices',
        name: 'Invoices',
        component: () => import('@/views/Invoices.vue')
    },

]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
