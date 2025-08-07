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
        >
          ⚙️ General
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'profile' }"
          @click="setTab('profile')"
        >
          👤 Profile
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: currentTab === 'security' }"
          @click="setTab('security')"
        >
          🔒 Security
        </a>
      </li>
    </ul>

    <!-- General Tab -->
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

    <!-- Profile Tab -->
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

    <!-- Security Tab -->
    <div v-else-if="currentTab === 'security'" class="card p-4">
      <h5 class="fw-semibold mb-2">🔒 Security Settings</h5>
      <p class="text-muted mb-4">
        Manage your account security and authentication
      </p>

      <!-- Password -->
      <div
        class="d-flex justify-content-between align-items-center border rounded px-3 py-3 mb-3"
      >
        <div>
          <div class="fw-semibold">Password</div>
          <div class="text-muted small">Last changed 3 months ago</div>
        </div>
        <button class="btn btn-outline-secondary">Change Password</button>
      </div>

      <!-- 2FA -->
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
  (newVal) => {
    currentTab.value = newVal || "general";
  }
);

function setTab(tab) {
  router.replace({ name: "settings", query: { tab } });
}

const form = ref({
  company: "CargoMax Logistics",
  taxId: "TAX123456789",
  email: "admin@cargomax.com",
  phone: "+1 (555) 123-4567",
  website: "www.cargomax.com",
  address: "123 Logistics Ave, Transport City, TC 12345",
});

const profile = ref({
  fullName: "John Rem",
  title: "Logistics Manager",
  email: "john.rem@cargomax.com",
  phone: "+1 (555) 987-6543",
});
</script>
