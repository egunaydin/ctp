<template>
  <div>
    <!-- Hamburger (sadece mobilde görünür) -->
    <button
        class="btn btn-outline-light position-absolute top-0 start-0 mt-2 ms-2 d-md-none"
        @click="toggleMenu"
        style="z-index: 1060;"
    >
      <Menu />
    </button>

    <!-- Sidebar (masaüstü için) -->
    <aside
        v-if="!isMobile"
        class="d-flex flex-column text-white p-3"
        style="width: 240px; min-height: 100vh;
             background-image: url('https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg');
             background-color: #1c1c1c;
             background-blend-mode: overlay;
             background-size: cover;
             border-radius: 0.75rem;"
    >
      <!-- LOGO -->
      <div class="text-uppercase fw-bold fs-6 mb-4">Logistics System</div>

      <!-- Menü -->
      <nav class="flex-grow-1 d-flex flex-column gap-2">
        <RouterLink to="/" class="nav-link sidebar-link">
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
      <div class="bg-white bg-opacity-25 rounded-4 text-white text-center p-3 mt-4">
        <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Profile"
            class="rounded-circle mb-2"
            style="width: 48px; height: 48px; object-fit: cover;"
        />
        <div class="fw-bold">Amelia Bernson</div>
        <div class="small mb-2">Your manager</div>
        <button class="btn btn-light btn-sm w-100 fw-semibold">Chat</button>
      </div>
    </aside>

    <!-- Mobil Menü Overlay -->
    <transition name="fade">
      <div
          v-if="isMenuOpen && isMobile"
          class="mobile-menu-overlay position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column p-4"
          style="z-index: 1050;"
      >
        <button class="btn btn-light align-self-end mb-4" @click="toggleMenu">
          <X class="icon" />
        </button>

        <RouterLink class="nav-link text-white fs-5 mb-3" to="/" @click="toggleMenu">🏠 Orders</RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/tracking" @click="toggleMenu">📍 Tracking</RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/invoices" @click="toggleMenu">📄 Invoices</RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/analytics" @click="toggleMenu">📊 Analytics</RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/management" @click="toggleMenu">👥 Management</RouterLink>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { LayoutDashboard, Map, FileText, BarChart, Users, Menu, X } from 'lucide-vue-next'

const isMenuOpen = ref(false)
const isMobile = ref(window.innerWidth < 768)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
    if (!isMobile.value) isMenuOpen.value = false
  })
})
</script>

<style scoped>
.sidebar-link {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  font-weight: 500;
}
.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.router-link-exact-active.sidebar-link {
  background-color: #fff;
  color: #0d6efd;
}

/* Animasyon */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
