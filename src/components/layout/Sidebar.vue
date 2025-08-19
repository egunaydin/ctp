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

      <nav class="flex-grow-1 d-flex flex-column gap-2">
        <!-- Dashboard -->
        <RouterLink to="/orders" class="nav-link sidebar-link">
          <Package class="me-2 icon" /> Orders
        </RouterLink>

        <RouterLink to="/dashboard" class="nav-link sidebar-link">
          <Map class="me-2 icon" /> Dashboard
        </RouterLink>

        <RouterLink to="/tracking" class="nav-link sidebar-link">
          <LayoutDashboard class="me-2 icon" /> Tracking
        </RouterLink>

        <RouterLink to="/invoices" class="nav-link sidebar-link">
          <FileText class="me-2 icon" /> Invoices
        </RouterLink>

        <RouterLink
          :to="{ name: 'settings', query: { tab: 'management' } }"
          class="nav-link sidebar-link"
          :class="{ 'is-active': isManagementActive }"
          active-class=""
          exact-active-class=""
        >
          <Users class="me-2 icon" /> Management
        </RouterLink>
      </nav>

      <!-- Management: sadece tab=management iken highlight -->
      <RouterLink
        :to="{ name: 'settings', query: { tab: 'management' } }"
        class="nav-link sidebar-link"
        :class="{ 'is-active': isManagementActive }"
        active-class=""
        exact-active-class=""
      >
        <Users class="me-2 icon" /> Management
      </RouterLink>

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
          to="/dashboard"
          @click="$emit('closeSidebar')"
        >
          🏠 Dashboard
        </RouterLink>

        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/orders"
          @click="$emit('closeSidebar')"
        >
          🗺️ Orders
        </RouterLink>

        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/tracking"
          @click="$emit('closeSidebar')"
        >
          📍 Tracking
        </RouterLink>

        <RouterLink
          class="nav-link text-white fs-5 mb-3"
          to="/invoices"
          @click="$emit('closeSidebar')"
        >
          📄 Invoices
        </RouterLink>

        <!-- Management (mobil) -->
        <RouterLink
          :to="{ name: 'settings', query: { tab: 'management' } }"
          class="nav-link text-white fs-5 mb-3"
          :class="{ 'is-active': isManagementActive }"
          active-class=""
          exact-active-class=""
          @click="$emit('closeSidebar')"
        >
          👥 Management
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, RouterLink } from "vue-router";
import {
  LayoutDashboard,
  Map,
  FileText,
  Users,
  Menu,
  Package,
  Package2,
  Package2Icon,
} from "lucide-vue-next";

const props = defineProps<{
  isMenuOpen: boolean;
  userName?: string;
  userRole?: string;
}>();

defineEmits(["closeSidebar"]);

const route = useRoute();

/** Sadece settings?tab=management iken true */
const isManagementActive = computed(
  () => route.name === "settings" && route.query.tab === "management"
);

const isMobile = ref(false);
const onResize = () => (isMobile.value = window.innerWidth < 768);
onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => window.removeEventListener("resize", onResize));

const displayName = computed(() => props.userName?.trim() || "Sinem BAHAR");
const displayRole = computed(() => props.userRole?.trim() || "Your manager");

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return "";
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

/* Varsayılan exact-active (Orders/Tracking/Invoices için) */
.router-link-exact-active.sidebar-link {
  background-color: #fff;
  color: #0d6efd;
}

/* Management için kendi aktif sınıfımız */
.sidebar-link.is-active {
  background-color: #fff;
  color: #0d6efd;
}

/* Kullanıcı kartı */
.user-card {
  text-align: center;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

/* Daha okunaklı avatar */
.avatar-initials {
  --avatar-bg: #1f2630;
  --avatar-border: #ffffffe6;
  --avatar-ring: rgba(0, 0, 0, 0.45);

  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: radial-gradient(
      120% 120% at 30% 25%,
      rgba(255, 255, 255, 0.14),
      rgba(255, 255, 255, 0) 45%
    ),
    var(--avatar-bg);
  border: 2px solid var(--avatar-border);
  box-shadow: 0 2px 10px var(--avatar-ring), 0 0 0 3px rgba(255, 255, 255, 0.08);

  color: #fff;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);

  display: flex;
  align-items: center;
  justify-content: center;
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
