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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
