<template>
  <div class="container py-2">
    <h2 class="fw-bold">Settings</h2>
    <p class="text-muted mb-4">Manage your account settings and preferences</p>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'general' }"
          @click="setTab('general')"
          href="#"
          role="tab"
          >⚙️ General</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'profile' }"
          @click="setTab('profile')"
          href="#"
          role="tab"
          >👤 Profile</a
        >
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'security' }"
          @click="setTab('security')"
          href="#"
          role="tab"
          >🔒 Security</a
        >
      </li>
    </ul>

    <!-- General -->
    <div v-if="currentTab === 'general'" class="card p-4">
      <h5 class="fw-semibold mb-2">🏢 Company Information</h5>
      <p class="text-muted mb-4">
        Update your company details and contact information
      </p>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Company Name</label>
          <input type="text" class="form-control" v-model="form.company" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Tax ID</label>
          <input type="text" class="form-control" v-model="form.taxId" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="form.email" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Phone</label>
          <input type="text" class="form-control" v-model="form.phone" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Website</label>
          <input type="text" class="form-control" v-model="form.website" />
        </div>
        <div class="col-md-12">
          <label class="form-label">Address</label>
          <textarea class="form-control" rows="2" v-model="form.address" />
        </div>
      </div>
    </div>

    <!-- Profile -->
    <div v-else-if="currentTab === 'profile'" class="card p-4">
      <h5 class="fw-semibold mb-2">👤 Profile Settings</h5>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-control" v-model="profile.fullName" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Job Title</label>
          <input type="text" class="form-control" v-model="profile.title" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" v-model="profile.email" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Phone</label>
          <input type="text" class="form-control" v-model="profile.phone" />
        </div>
      </div>
    </div>

    <!-- Security -->
    <div v-else-if="currentTab === 'security'" class="card p-4">
      <h5 class="fw-semibold mb-2">🔒 Security Settings</h5>
      <p class="text-muted mb-4">
        Manage your account security and authentication
      </p>

      <div
        class="d-flex justify-content-between align-items-center border rounded px-3 py-3 mb-3"
      >
        <div>
          <div class="fw-semibold">Password</div>
          <div class="text-muted small">Last changed 3 months ago</div>
        </div>
        <button class="btn btn-outline-secondary">Change Password</button>
      </div>

      <div
        class="d-flex justify-content-between align-items-center border rounded px-3 py-3 mb-3"
      >
        <div>
          <div class="fw-semibold">Two-Factor Authentication</div>
          <div class="text-muted small">
            Add an extra layer of security to your account
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge text-bg-light border">Disabled</span>
          <button class="btn btn-outline-secondary">Enable</button>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-end mt-4">
      <button class="btn btn-dark px-4">💾 Save Changes</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const currentTab = ref(route.query.tab || "general");
watch(
  () => route.query.tab,
  (n) => (currentTab.value = n || "general")
);

function setTab(tab) {
  router.replace({ name: "settings", query: { tab } });
}

const form = ref({
  company: "Alışan Logistics L.T.D.",
  taxId: "TAX123456789",
  email: "info@alisanlogistics.com",
  phone: "+90 (216) 469 15 15",
  website: "www.alisanlogistics.com",
  address:
    "İçerenköy Mahallesi. Değirmen Yolu Cd. No:28, Asia Ofis Park A2 Blok K:1, 34752 Ataşehir/İstanbul",
});

const profile = ref({
  fullName: "Ensar Günaydın",
  title: "Yazilim Sefi",
  email: "Ensar.GUNAYDIN@alisanlogistics.com",
  phone: "+90 (530) 300 77 10",
});
</script>

<style scoped>
/* OrderDetailPanel ile aynı tab görünümü */
.nav-tabs {
  border-bottom: 1px solid var(--border, #dee2e6);
}
.nav-tabs .nav-link {
  color: var(--text, #212529);
  border: 1px solid transparent;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0.5rem 1rem;
  background: transparent;
  opacity: 0.75;
  transition: all 0.15s ease-in-out;
}
.nav-tabs .nav-link:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--text, #000) 6%, transparent);
}
.nav-tabs .nav-link.active {
  opacity: 1;
  font-weight: 700;
  background: color-mix(in srgb, var(--text, #000) 12%, transparent);
  border-color: var(--border, #dee2e6) var(--border, #dee2e6) transparent;
  border-bottom: 3px solid var(--accent, #4dabf7);
  color: var(--text, #212529);
}

/* Tema değişkenleri (OrderDetailPanel ile aynı) */
:global([data-bs-theme="dark"]) {
  --accent: #4dabf7;
  --border: #3a3f44;
  --text: #f1f3f5;
}
:global([data-bs-theme="light"]) {
  --accent: #1971c2;
  --border: #dee2e6;
  --text: #212529;
}
</style>
