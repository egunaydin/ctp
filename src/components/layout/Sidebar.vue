<template>
  <div>
    <!-- Sidebar (masaüstü için) -->
    <aside v-if="!isMobile" class="d-flex flex-column text-white p-3" style="width: 200px; min-height: 100vh;
             background-image: url('https://images.pexels.com/photos/93398/pexels-photo-93398.jpeg');
             background-color: #1c1c1c;
             background-blend-mode: overlay;
             background-size: cover;
             border-radius: 0.75rem;">

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
        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Profile" class="rounded-circle mb-2"
          style="width: 48px; height: 48px; object-fit: cover;" />
        <div class="fw-bold">Amelia Bernson</div>
        <div class="small mb-2">Your manager</div>
        <button class="btn btn-light btn-sm w-100 fw-semibold">Chat</button>
      </div>
    </aside>

    <!-- Mobil Menü -->
    <div v-if="isMenuOpen && isMobile" class="mobile-menu-overlay">
      <div class="mobile-sidebar">
        <!-- Menü Butonu -->
        <button class="btn btn-outline-light align-self-start mb-4" @click="$emit('closeSidebar')"
          style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <Menu :size="40" class="text-white" />
        </button>

        <!-- Menü Linkleri -->
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/" @click="$emit('closeSidebar')">🏠 Orders</RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/tracking" @click="$emit('closeSidebar')">📍 Tracking
        </RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/invoices" @click="$emit('closeSidebar')">📄 Invoices
        </RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/analytics" @click="$emit('closeSidebar')">📊 Analytics
        </RouterLink>
        <RouterLink class="nav-link text-white fs-5 mb-3" to="/management" @click="$emit('closeSidebar')">👥 Management
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { LayoutDashboard, Map, FileText, BarChart, Users, Menu } from 'lucide-vue-next'

const props = defineProps<{
  isMenuOpen: boolean
}>()

const emit = defineEmits(['closeSidebar'])

const isMobile = ref(window.innerWidth < 768)

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
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
  font-weight: 500;
}

.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.router-link-exact-active.sidebar-link {
  background-color: #fff;
  color: #0d6efd;
}

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