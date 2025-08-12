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

      <!-- Mobil settings -->
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

    <!-- Sağ taraf: kullanıcı kartı (desktop) -->
    <div
      class="position-relative d-none d-md-flex align-items-center ms-3 user-dropdown"
      ref="dropdownWrapper"
    >
      <!-- Desktop dark mode -->
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

      <!-- Kullanıcı kartı -->
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
        <!-- Otomatik baş harf avatar -->
        <div
          class="avatar-initials me-2"
          :style="{ backgroundColor: avatarBg, color: avatarFg }"
        >
          {{ initials }}
        </div>

        <div class="me-auto">
          <div class="fw-semibold small" style="color: var(--text)">
            {{ displayName }}
          </div>
          <div class="text-muted" style="font-size: 0.75rem">
            {{ jobTitle }}
          </div>
        </div>
        <ChevronDown :size="16" />
      </div>

      <!-- Dropdown menü -->
      <div
        v-if="showDropdown"
        class="dropdown-menu show mt-2 shadow user-menu"
        style="position: absolute; top: 100%; right: 0; display: block"
        role="menu"
      >
        <button class="dropdown-item" @click="goToSettings">⚙️ Settings</button>
        <button class="dropdown-item" @click="goToProfile">👤 Profile</button>
        <button class="dropdown-item" @click="logout">🚪 Log out</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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

/* Şimdilik sabit isim ve unvan */
const displayName = ref("Ensar Günaydın");
const jobTitle = ref("Yazılım Şefi");

/* Baş harfleri otomatik üret */
const initials = computed(() =>
  displayName.value
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0]!)
    .slice(0, 2)
    .join("")
    .toUpperCase()
);

/* Hafif “name-based” renk */
function hashToHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
const avatarBg = computed(
  () => `hsl(${hashToHue(displayName.value)}, 25%, 45%)`
);
const avatarFg = computed(() => `#fff`);

/* Dropdown & tema */
const showDropdown = ref(false);
const isDark = ref(
  document.documentElement.getAttribute("data-bs-theme") === "dark"
);
const dropdownWrapper = ref<HTMLElement | null>(null);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}
function closeDropdown() {
  showDropdown.value = false;
}
function handleClickOutside(e: MouseEvent) {
  const el = dropdownWrapper.value;
  if (showDropdown.value && el && !el.contains(e.target as Node))
    closeDropdown();
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
.user-card {
  border: 1px solid var(--border);
}
.user-card:hover {
  background-color: var(--hover);
}

/* Avatar baş harf */
.avatar-initials {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 0.2px;
}

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

.btn-outline-secondary {
  border-color: var(--border);
}
</style>
