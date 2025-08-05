<template>
  <div class="min-vh-100 py-4">
    <div class="container">
      <div class="bg-light rounded-4 shadow-sm p-3 position-relative">

        <!-- Masaüstü -->
        <div class="d-none d-md-flex">
          <div class="rounded-3 overflow-hidden" style="min-width: 200px;">
            <Sidebar />
          </div>

          <div class="flex-grow-1 d-flex flex-column ms-3">
            <Topbar />
            <main class="flex-grow-1 mt-0 ">
              <slot />
            </main>
          </div>
        </div>

        <!-- Mobil -->
        <div class="d-block d-md-none">
          <Topbar @openSidebar="showMobileMenu = true" />
          <main class="mt-1">
            <slot />
          </main>
        </div>

        <!-- Mobil Sidebar -->
        <div v-if="showMobileMenu" class="mobile-sidebar-wrapper">
          <!-- Overlay -->
          <div class="mobile-sidebar-overlay" @click="showMobileMenu = false"></div>

          <!-- Sidebar Panel -->
          <div class="mobile-sidebar-panel">
            <Sidebar :isMenuOpen="showMobileMenu" @closeSidebar="showMobileMenu = false" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

const showMobileMenu = ref(false)
</script>

<style scoped>
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

/* Slide animasyonları kaldırıldı */
.slide-panel-enter-active,
.slide-panel-leave-active,
.slide-panel-enter-from,
.slide-panel-leave-to {
  transition: none !important;
  transform: none !important;
}
</style>
