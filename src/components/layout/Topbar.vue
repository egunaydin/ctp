<template>
  <div class="d-flex justify-content-between align-items-center px-3 py-2">
    <!-- Sol: Sidebar + Arama + Mobil Ayarlar -->
    <div
      class="d-flex align-items-center gap-2 flex-grow-1"
      style="max-width: 500px"
    >
      <!-- Mobil Hamburger Butonu -->
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

      <!-- Mobil Ayarlar Butonu -->
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
      >
        <Settings :size="18" />
      </button>
    </div>

    <!-- Sağ: Kullanıcı Kartı (Sadece Masaüstü) -->
    <div class="position-relative d-none d-md-flex align-items-center ms-3">
      <div
        class="bg-white rounded-3 shadow-sm d-flex align-items-center px-3 py-2 user-card"
        @click="toggleDropdown"
        style="cursor: pointer; min-width: 200px"
      >
        <img
          src="https://randomuser.me/api/portraits/men/45.jpg"
          alt="Profile"
          class="rounded-circle me-2"
          style="width: 36px; height: 36px; object-fit: cover"
        />
        <div class="me-auto">
          <div class="fw-semibold small" style="color: black">John Rem</div>
          <div class="text-muted" style="font-size: 0.75rem">
            Logistics manager
          </div>
        </div>
        <ChevronDown :size="16" />
      </div>

      <!-- Dropdown Menu -->
      <div
        v-if="showDropdown"
        class="dropdown-menu show mt-2 shadow"
        style="position: absolute; top: 100%; right: 0; display: block"
      >
        <button class="dropdown-item" @click="goToProfile">👤 Profile</button>
        <button class="dropdown-item" @click="goToSettings">⚙️ Settings</button>
        <button class="dropdown-item">➜] Log Out</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search, ChevronDown, Menu, Settings } from "lucide-vue-next";

const emit = defineEmits(["openSidebar"]);
const router = useRouter();
const showDropdown = ref(false);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function goToProfile() {
  showDropdown.value = false;
  router.push({ name: "settings", query: { tab: "profile" } });
}

function goToSettings() {
  showDropdown.value = false;
  router.push({ name: "settings", query: { tab: "general" } });
}

function logout() {
  showDropdown.value = false;
  // Burada gerçek logout işlemini çağırabilirsin:
  console.log("Logging out...");
  router.push("/login"); // Örnek olarak login sayfasına yönlendirme
}
</script>

<style scoped>
.user-card:hover {
  background-color: #f8f9fa;
}

.dropdown-menu {
  min-width: 160px;
  border-radius: 0.5rem;
  background-color: white;
  padding: 4px 0;
  z-index: 1000;
}

.dropdown-item {
  font-size: 0.875rem;
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}
</style>
