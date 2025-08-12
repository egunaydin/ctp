<template>
  <div class="d-flex justify-content-between align-items-center px-3 py-2">
    <!-- Sol: Sidebar + Arama + Mobil Ayarlar -->
    <div
      class="d-flex align-items-center gap-2 flex-grow-1"
      style="max-width: 500px"
    >
      <!-- Mobil Hamburger -->
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

      <!-- Search -->
      <div class="position-relative w-100">
        <input
          type="text"
          class="form-control form-control-sm rounded-3 ps-4 pe-5"
          placeholder="Search"
        />
        <Search
          class="position-absolute top-50 translate-middle-y"
          style="right: 15px"
          :size="16"
        />
      </div>

      <!-- Mobil: Dark toggle -->
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

      <!-- Mobil: Settings -->
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

    <!-- Sağ: Kullanıcı Kartı (Desktop) -->
    <div
      class="position-relative d-none d-md-flex align-items-center ms-3 user-dropdown"
      ref="dropdownWrapper"
    >
      <!-- Desktop dark toggle -->
      <button
        class="btn btn-outline-secondary me-2"
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

      <div
        class="rounded-3 shadow-sm d-flex align-items-center px-3 py-2 user-card"
        @click="toggleDropdown"
        style="
          cursor: pointer;
          min-width: 200px;
          background: var(--card-bg);
          color: var(--text);
        "
        aria-haspopup="menu"
        :aria-expanded="showDropdown ? 'true' : 'false'"
      >
        <img
          src="https://randomuser.me/api/portraits/men/45.jpg"
          alt="Profile"
          class="rounded-circle me-2"
          style="width: 36px; height: 36px; object-fit: cover"
        />
        <div class="me-auto">
          <div class="fw-semibold small" style="color: var(--text)">
            John Rem
          </div>
          <div class="text-muted" style="font-size: 0.75rem">
            Logistics manager
          </div>
        </div>
        <ChevronDown :size="16" />
      </div>

      <!-- Dropdown Menu -->
      <div
        v-if="showDropdown"
        class="dropdown-menu show mt-2 shadow user-menu"
        style="position: absolute; top: 100%; right: 0; display: block"
        role="menu"
      >
        <button class="dropdown-item" @click="goToProfile">👤 Profile</button>
        <button class="dropdown-item" @click="goToSettings">⚙️ Settings</button>
        <button class="dropdown-item" @click="logout">🚪 Log out</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import {
  Search,
  ChevronDown,
  Menu,
  Settings,
  Sun,
  Moon,
} from "lucide-vue-next";

const emit = defineEmits(["openSidebar"]);
const router = useRouter();

const showDropdown = ref(false);
const isDark = ref(false);

// 🔸 ref artık SADECE kullanıcı kartı+menüyü kapsıyor
const dropdownWrapper = ref<HTMLElement | null>(null);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}
function closeDropdown() {
  showDropdown.value = false;
}

function handleClickOutside(e: MouseEvent) {
  const el = dropdownWrapper.value;
  if (!el) return;
  if (showDropdown.value && !el.contains(e.target as Node)) closeDropdown();
}
function handleEscape(e: KeyboardEvent) {
  if (e.key === "Escape") closeDropdown();
}

function goToProfile() {
  closeDropdown();
  router.push({ name: "settings", query: { tab: "profile" } });
}
function goToSettings() {
  closeDropdown();
  router.push({ name: "settings", query: { tab: "general" } });
}
function logout() {
  closeDropdown();
  router.push("/login");
}

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute(
    "data-bs-theme",
    isDark.value ? "dark" : "light"
  );
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
  document.addEventListener("keydown", handleEscape, true);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside, true);
  document.removeEventListener("keydown", handleEscape, true);
});
</script>

<style scoped>
.user-card:hover {
  background-color: var(--hover);
}

/* Açılır menünün tema uyumu ve katmanı */
.user-menu {
  min-width: 200px;
  border-radius: 0.5rem;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  z-index: 2000;
}
.user-menu .dropdown-item {
  font-size: 0.875rem;
  padding: 8px 12px;
  color: var(--text);
}
.user-menu .dropdown-item:hover {
  background: var(--hover);
}
</style>
