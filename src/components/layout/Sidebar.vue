<template>
  <div>
    <!-- Sidebar (masaüstü) -->
    <aside
      v-if="!isMobile"
      class="d-flex flex-column p-3"
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
      <div class="text-uppercase fw-bold fs-6 mb-4 text-center text-white">
        Logistics System
      </div>

      <!-- Menü -->
      <nav class="flex-grow-1 d-flex flex-column gap-2">
        <RouterLink to="/dashboard" class="nav-link sidebar-link">
          <Map class="me-2 icon" /> Dashboard
        </RouterLink>

        <RouterLink to="/orders" class="nav-link sidebar-link">
          <Package class="me-2 icon" /> Orders
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

      <!-- TEK CONTAINER: Kullanıcı + Aksiyonlar -->
      <div class="user-card onebox rounded-4 p-3 mt-4">
        <!-- Avatar -->
        <div
          class="avatar-initials mb-2 mx-auto"
          :style="{ backgroundColor: avatarBg, color: '#fff' }"
          aria-label="User initials"
        >
          {{ initials }}
        </div>

        <!-- İsim / Ünvan -->
        <div class="fw-bold text-center" :style="{ color: 'var(--text)' }">
          {{ displayName }}
        </div>
        <div
          class="small text-center mb-3"
          style="opacity: 0.8"
          :style="{ color: 'var(--text)' }"
        >
          {{ displayRole }}
        </div>

        <!-- Aksiyonlar -->
        <div class="d-grid gap-2">
          <button
            class="btn btn-light btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center"
            @click="goToSettings"
          >
            <Settings class="me-2" :size="16" /> Settings
          </button>

          <button
            class="btn btn-danger btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center"
            @click="logout"
          >
            <LogOut class="me-2" :size="16" /> Log out
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobil Menü -->
    <div v-if="isMenuOpen && isMobile" class="mobile-menu-overlay">
      <div class="mobile-sidebar">
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

        <!-- (mobilde hızlı ayar istersen) -->
        <div class="mt-4 d-grid gap-2">
          <button
            class="btn btn-light btn-sm fw-semibold d-flex align-items-center justify-content-center"
            @click="
              () => {
                goToSettings();
                $emit('closeSidebar');
              }
            "
          >
            <Settings class="me-2" :size="16" /> Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import {
  LayoutDashboard,
  Map,
  FileText,
  Users,
  Menu,
  Package,
  Settings,
  LogOut,
} from "lucide-vue-next";

/* Props */
const props = defineProps<{
  isMenuOpen: boolean;
  userName?: string;
  userRole?: string;
}>();
defineEmits(["closeSidebar"]);

const route = useRoute();
const router = useRouter();

/** Yalnızca settings?tab=management iken aktif */
const isManagementActive = computed(
  () => route.name === "settings" && route.query.tab === "management"
);

/* Responsive */
const isMobile = ref(false);
const onResize = () => (isMobile.value = window.innerWidth < 768);
onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => window.removeEventListener("resize", onResize));

/* Kullanıcı bilgileri (varsayılan) */
const displayName = computed(() => props.userName?.trim() || "Ensar Günaydın");
const displayRole = computed(() => props.userRole?.trim() || "Yazılım Şefi");

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

/* Avatar rengi (isim tabanlı) */
function hashToHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
const avatarBg = computed(
  () => `hsl(${hashToHue(displayName.value)}, 25%, 45%)`
);

/* Aksiyonlar */
function goToSettings() {
  router.push({ name: "settings", query: { tab: "general" } });
}

/* ===== useAuth'i dinamik import ile (require'siz) yükle ===== */
type UseAuthFn = () => {
  isAuthenticated: { value: boolean };
  logout?: () => void;
};
let useAuth: UseAuthFn | undefined = undefined;

if (typeof window !== "undefined") {
  import("@/useAuth")
    .then((m) => {
      useAuth = m.useAuth as UseAuthFn;
    })
    .catch(() => {
      /* composable yoksa sorun değil */
    });
}

/* Logout */
async function logout() {
  try {
    localStorage.removeItem("auth");
    if (useAuth) {
      const auth = useAuth();
      if (auth?.logout) auth.logout();
      else if (auth?.isAuthenticated) auth.isAuthenticated.value = false;
    }
  } finally {
    await router.push({ name: "Login" });
  }
}
</script>

<style scoped>
/* Tema-duyarlı değişkenler */
:root,
:host {
  --card-bg: rgba(255, 255, 255, 0.9);
  --text: #212529;
  --border: rgba(0, 0, 0, 0.12);
  --hover: rgba(255, 255, 255, 0.1);
}
:root[data-bs-theme="dark"],
:host([data-bs-theme="dark"]) {
  --card-bg: rgba(33, 37, 41, 0.92);
  --text: #f8f9fa;
  --border: rgba(255, 255, 255, 0.16);
  --hover: rgba(255, 255, 255, 0.12);
}

/* Linkler */
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

/* exact-active (Orders/Tracking/Invoices) */
.router-link-exact-active.sidebar-link {
  background-color: #fff;
  color: #0d6efd;
}

/* Management özel aktif görünümü */
.sidebar-link.is-active {
  background-color: #fff;
  color: #0d6efd;
}

/* Tek container */
.onebox {
  backdrop-filter: blur(4px);
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text);
}

/* Avatar */
.avatar-initials {
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(255, 255, 255, 0.08);
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
