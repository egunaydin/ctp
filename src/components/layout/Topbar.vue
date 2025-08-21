<template>
  <div class="d-flex justify-content-between align-items-center px-3 py-2">
    <!-- Sol taraf: mobil menü + arama + mobil aksiyonlar -->
    <div
      class="d-flex align-items-center gap-2 flex-grow-1"
      style="max-width: 500px"
    >
      <!-- Mobil menü -->
      <button
        class="btn btn-outline-secondary d-md-none"
        @click="emit('openSidebar')"
        style="
          height: 36px;
          width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        aria-label="Open sidebar"
      >
        <Menu :size="20" />
      </button>

      <!-- Arama -->
      <div class="position-relative w-100">
        <input
          v-model="search"
          type="text"
          class="form-control form-control-sm rounded-3 ps-4 pe-5"
          placeholder="Search"
          @keyup.enter="onSearch"
          aria-label="Search"
        />
        <Search
          class="position-absolute top-50 translate-middle-y"
          style="right: 15px"
          :size="16"
        />
      </div>

      <!-- Mobil dark mode -->
      <button
        class="btn btn-outline-secondary d-md-none"
        @click="toggleDarkMode"
        style="
          height: 36px;
          width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        aria-label="Toggle dark mode"
      >
        <Sun v-if="!isDark" :size="18" />
        <Moon v-else :size="18" />
      </button>

      <!-- Mobil settings (opsiyonel) -->
      <button
        class="btn btn-outline-secondary d-md-none"
        @click="goToSettings"
        style="
          height: 36px;
          width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        aria-label="Open settings"
      >
        <Settings :size="18" />
      </button>
    </div>

    <!-- Sağ taraf: sadece (desktop) aksiyonlar -->
    <div class="d-none d-md-flex align-items-center gap-2">
      <!-- Desktop dark mode SAĞA ALINDI -->
      <button
        class="btn btn-outline-secondary"
        @click="toggleDarkMode"
        style="
          height: 36px;
          width: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        "
        aria-label="Toggle dark mode"
      >
        <Sun v-if="!isDark" :size="18" />
        <Moon v-else :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search, Menu, Settings, Sun, Moon } from "lucide-vue-next";

const emit = defineEmits<{
  (e: "openSidebar"): void;
}>();

const router = useRouter();

/* Arama */
const search = ref("");
function onSearch() {
  // İstersen buraya arama navigasyonu ekle
  // router.push({ name: 'search', query: { q: search.value } })
}

/* Tema */
const isDark = ref(
  document.documentElement.getAttribute("data-bs-theme") === "dark"
);
function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute(
    "data-bs-theme",
    isDark.value ? "dark" : "light"
  );
}

/* Settings (opsiyonel) */
function goToSettings() {
  router.push({ name: "settings", query: { tab: "general" } });
}
</script>

<style scoped>
/* Görsel tutarlılık için hafif sınırlar (globalde yoksa görünür olsun) */
:root,
:host {
  --border: rgba(0, 0, 0, 0.12);
}
:root[data-bs-theme="dark"],
:host([data-bs-theme="dark"]) {
  --border: rgba(255, 255, 255, 0.16);
}

.btn-outline-secondary {
  border-color: var(--border);
}
</style>
