<template>
  <div>
    <!-- Sidebar (masaüstü için) -->
    <aside
      v-if="!isMobile"
      class="d-flex flex-column text-white p-3"
      style="
        width: 200px;
        min-height: 90vh;
        background-image: url('https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg');
        background-color: #1c1c1c;
        background-blend-mode: overlay;
        background-size: cover;
        border-radius: 0.75rem;
      "
    >
      <!-- LOGO -->
      <div class="text-uppercase fw-bold fs-6 mb-4 text-center">
        Logistics System
      </div>

      <!-- Menü -->
      <nav class="flex-grow-1 d-flex flex-column gap-2">
        <RouterLink to="/dashboard" class="nav-link sidebar-link">
          <LayoutDashboard class="me-2 icon" /> Orders
        </RouterLink>
        <RouterLink to="/tracking" class="nav-link sidebar-link">
          <Map class="me-2 icon" /> Tracking
        </RouterLink>
        <RouterLink to="/invoices" class="nav-link sidebar-link">
          <FileText class="me-2 icon" /> Invoices
        </RouterLink>
        <RouterLink to="/analytics" class="nav-link sidebar-link">
          <BarChart class="me-2 icon" /> Analytics
        </RouterLink>
        <RouterLink to="/management" class="nav-link sidebar-link">
          <Users class="me-2 icon" /> Management
        </RouterLink>
      </nav>

      <!-- Kullanıcı Kutusu -->
      <div
        class="user-card bg-white bg-opacity-25 rounded-4 text-white p-3 mt-4"
      >
        <!-- Baş harf avatarı -->
        <div class="avatar-initials mb-2 mx-auto" aria-label="User initials">
          {{ initials }}
        </div>

        <div class="fw-bold text-center">{{ displayName }}</div>
        <div class="small mb-2 text-center">{{ displayRole }}</div>
        <button class="btn btn-light btn-sm w-100 fw-semibold">Chat</button>
      </div>
    </aside>

    <!-- Mobil Menü -->
    <div v-if="isMenuOpen && isMobile" class="mobile-menu-overlay">
      <div class="mobile-sidebar">
        <!-- Menü Butonu -->
        <button
          class="btn btn-outline-light align-self-start mb-4"
          @click="$emit('closeSidebar')"
          style="
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <Menu :size="40" class="text-white" />
        </button>

        <!-- Menü Linkleri -->
        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/"
          @click="$emit('closeSidebar')"
          >🏠 Orders</RouterLink
        >
        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/tracking"
          @click="$emit('closeSidebar')"
          >📍 Tracking</RouterLink
        >
        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/invoices"
          @click="$emit('closeSidebar')"
          >📄 Invoices</RouterLink
        >
        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/analytics"
          @click="$emit('closeSidebar')"
          >📊 Analytics</RouterLink
        >
        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/management"
          @click="$emit('closeSidebar')"
          >👥 Management</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { RouterLink } from "vue-router";
import {
  LayoutDashboard,
  Map,
  FileText,
  BarChart,
  Users,
  Menu,
} from "lucide-vue-next";

const props = defineProps<{
  isMenuOpen: boolean;
  userName?: string;
  userRole?: string;
}>();

defineEmits(["closeSidebar"]);

const isMobile = ref(window.innerWidth < 768);
const onResize = () => (isMobile.value = window.innerWidth < 768);
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));

const displayName = computed(() => props.userName?.trim() || "Sinem BAHAR");
const displayRole = computed(() => props.userRole?.trim() || "Your manager");

/** İsimden baş harfleri üretir (TR dil kurallarıyla) */
function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] || "" : "";
  return (first + last).toLocaleUpperCase("tr-TR");
}

const initials = computed(() => getInitials(displayName.value));
</script>

<style scoped>
.sidebar-link {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-weight: 500;
}
.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.router-link-exact-active.sidebar-link {
  background-color: #fff;
  color: #0d6efd;
}

/* Kullanıcı kartını ortala ve belirginleştir */
.user-card {
  text-align: center;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Baş harf avatarı: net çember + koyu arka planla uyumlu degrade */
.avatar-initials {
  width: 56px; /* biraz büyüttüm, çember daha net */
  height: 56px;
  border-radius: 9999px;

  /* yumuşak ışık ve derinlik */
  background: radial-gradient(
      circle at 30% 30%,
      rgba(255, 255, 255, 0.25),
      rgba(255, 255, 255, 0.06) 60%,
      rgba(255, 255, 255, 0.02)
    ),
    linear-gradient(145deg, #ffffff, #8a8a8a);

  /* belirgin çember */
  border: 2px solid rgba(255, 255, 255, 0.85);

  /* dış halka ve gölge */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 4px rgba(13, 110, 253, 0.18);

  color: #fff;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.4px;

  display: flex;
  align-items: center;
  justify-content: center;

  /* ortalama */
  margin-left: auto;
  margin-right: auto;
}

/* Mobil menü */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1050;
  display: flex;
  align-items: stretch;
  justify-content: flex-start;
}
.mobile-sidebar {
  background-color: rgba(0, 0, 0, 0.546);
  width: 100%;
  max-width: 320px;
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.4);
}
.mobile-sidebar .nav-link {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}
.mobile-sidebar .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
