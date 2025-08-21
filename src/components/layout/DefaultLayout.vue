<template>
  <div class="layout-wrap min-vh-90 py-4">
    <div class="container">
      <div class="rounded-4 shadow-sm p-3 position-relative layout-card">
        <!-- Masaüstü -->
        <div class="d-none d-md-flex">
          <div class="rounded-3 overflow-hidden" style="min-width: 200px">
            <Sidebar />
          </div>

          <div class="flex-grow-1 d-flex flex-column ms-3">
            <!-- Sadece dashboard değilse Topbar göster -->
            <Topbar v-if="!isDashboard" />
            <main class="flex-grow-1 mt-0">
              <slot />
            </main>
          </div>
        </div>

        <!-- Mobil -->
        <div class="d-block d-md-none">
          <Topbar v-if="!isDashboard" @openSidebar="showMobileMenu = true" />
          <main class="mt-1">
            <slot />
          </main>
        </div>

        <!-- Mobil Sidebar -->
        <div v-if="showMobileMenu" class="mobile-sidebar-wrapper">
          <!-- Overlay -->
          <div
            class="mobile-sidebar-overlay"
            @click="showMobileMenu = false"
          ></div>

          <!-- Sidebar Panel -->
          <div class="mobile-sidebar-panel">
            <Sidebar
              :isMenuOpen="showMobileMenu"
              @closeSidebar="showMobileMenu = false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "./Sidebar.vue";
import Topbar from "./Topbar.vue";

const showMobileMenu = ref(false);
const route = useRoute();

// Eğer route adı "dashboard" ise true döner
const isDashboard = computed(() => route.name === "dashboard");
</script>

<style scoped>
.layout-wrap {
  --bg: var(--bs-body-bg);
  background: radial-gradient(
      1200px 600px at 10% 5%,
      rgba(13, 109, 253, 0.18),
      transparent 60%
    ),
    radial-gradient(
      900px 600px at 90% 105%,
      rgba(111, 66, 193, 0.18),
      transparent 60%
    ),
    var(--bg);
  padding: 24px;
}

/* İç kart */
.layout-card {
  background: var(--card-bg, #fff);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Mobil sidebar panel */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: fit-content;
  height: 100vh;
  background-color: #1c1c1c;
  z-index: 1055;
  padding: 1rem;
  overflow-y: auto;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.3);
}

.slide-panel-enter-active,
.slide-panel-leave-active,
.slide-panel-enter-from,
.slide-panel-leave-to {
  transition: none !important;
  transform: none !important;
}

:root[data-bs-theme="dark"] .layout-card {
  --card-bg: rgba(33, 37, 41, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
