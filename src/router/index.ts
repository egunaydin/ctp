import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuth } from "@/useAuth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { layout: "none", guestOnly: true },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/Dashboard.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "Orders",
    component: () => import("@/views/Orders.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/tracking",
    name: "Tracking",
    component: () => import("@/views/Tracking.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/views/Settings.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/invoices",
    name: "Invoices",
    component: () => import("@/views/Invoices.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global guard
router.beforeEach((to, _from, next) => {
  const authed = localStorage.getItem("auth") === "1";

  if (to.meta.requiresAuth && !authed) {
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (to.meta.guestOnly && authed) {
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
