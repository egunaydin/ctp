<template>
  <div class="d-flex justify-content-between align-items-center px-0 py-0">
    <!-- Search -->
    <div class="flex-grow-1 me-2 position-relative" style="max-width: 400px;">
      <input
          type="text"
          class="form-control form-control-sm rounded-3 ps-4 pe-5"
          placeholder="Search"
      />
      <Search
          class="position-absolute top-50 translate-middle-y"
          style="right: 15px;"
          :size="16"
      />
    </div>

    <!-- User Card (gizle göster) -->
    <div
        class="bg-white rounded-3 shadow-sm d-none d-md-flex align-items-center px-3 py-2"
        style="min-width: 200px;"
    >
      <img
          src="https://randomuser.me/api/portraits/men/45.jpg"
          alt="Profile"
          class="rounded-circle me-2"
          style="width: 36px; height: 36px; object-fit: cover;"
      />
      <div class="me-auto">
        <div class="fw-semibold small">John Rem</div>
        <div class="text-muted" style="font-size: 0.75rem;">Logistics manager</div>
      </div>
      <ChevronDown :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, ChevronDown } from 'lucide-vue-next'
</script>
