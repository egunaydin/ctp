<template>
  <div class="d-flex justify-content-between align-items-center px-3 py-2">
    <!-- Sol Blok: Hamburger + Search -->
    <div class="d-flex align-items-center gap-2 flex-grow-1" style="max-width: 500px;">
      <!-- Mobil Hamburger Butonu -->
      <button class="btn btn-outline-secondary d-md-none" @click="emit('openSidebar')"
        style="height: 36px; width: 36px; display: flex; align-items: center; justify-content: center;">
        <Menu :size="20" />
      </button>

      <!-- Search -->
      <div class="position-relative w-100">
        <input type="text" class="form-control form-control-sm rounded-3 ps-4 pe-5" placeholder="Search" />
        <Search class="position-absolute top-50 translate-middle-y" style="right: 15px;" :size="16" />
      </div>
    </div>

    <!-- Sağ Blok: User Card (Sadece md ve üzeri görünür) -->
    <div class="bg-white rounded-3 shadow-sm d-none d-md-flex align-items-center px-3 py-2"
      style="min-width: 200px; margin-left: 16px;">
      <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Profile" class="rounded-circle me-2"
        style="width: 36px; height: 36px; object-fit: cover;" />
      <div class="me-auto">
        <div class="fw-semibold small" style="color: black;">John Rem</div>
        <div class="text-muted" style="font-size: 0.75rem;">Logistics manager</div>
      </div>
      <ChevronDown :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, ChevronDown, Menu } from 'lucide-vue-next'

const emit = defineEmits(['openSidebar'])
</script>