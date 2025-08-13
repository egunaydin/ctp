<template>
  <div
    class="login-wrap min-vh-100 d-flex align-items-center justify-content-center position-relative"
  >
    <!-- Tema değiştirme butonu sağ üst -->
    <button
      class="btn btn-outline-secondary theme-toggle-btn"
      @click="toggleDarkMode"
      aria-label="Toggle dark mode"
    >
      <Sun v-if="!isDark" :size="18" />
      <Moon v-else :size="18" />
    </button>

    <div class="login-card card shadow-lg p-4 p-md-5">
      <!-- Logo -->
      <div class="logo-container mx-auto mb-3">
        <img
          src="https://img-kariyer.mncdn.com/mnpadding/1200/630/FFFFFF/UploadFiles/Clients/SquareLogo/313/1313_298630.jpeg"
          alt="Alışan Logistics"
          class="logo-img"
        />
      </div>

      <!-- HATA MESAJI -->
      <transition name="fade-fast">
        <div
          v-if="error"
          class="invalid-hint text-danger small mb-3"
          role="alert"
          aria-live="polite"
        >
          {{ error }}
        </div>
      </transition>

      <form @submit.prevent="onSubmit" novalidate>
        <!-- Email -->
        <div class="mb-3">
          <label class="form-label fs-6">E-mail</label>
          <input
            v-model.trim="email"
            type="email"
            class="form-control form-control-lg"
            autocomplete="username"
            required
            autofocus
            inputmode="email"
          />
        </div>

        <!-- Password -->
        <transition name="collapse">
          <div v-if="email" class="collapsible mb-3">
            <label class="form-label fs-6">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-control form-control-lg"
              autocomplete="current-password"
              required
            />
          </div>
        </transition>

        <!-- Submit button -->
        <transition name="collapse">
          <div v-if="email && password" class="collapsible d-grid mt-2">
            <button
              class="btn btn-primary btn-lg"
              type="submit"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
              />
              Login
            </button>
          </div>
        </transition>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/useAuth";
import { Sun, Moon } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const isDark = ref(
  document.documentElement.getAttribute("data-bs-theme") === "dark"
);

async function onSubmit() {
  error.value = "";
  loading.value = true;

  try {
    const ok = await login(email.value, password.value);
    if (ok) {
      const target = (route.query.redirect as string) || "/dashboard";
      router.replace(target);
    } else {
      error.value = "Invalid e-mail or password.";
    }
  } catch {
    error.value = "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
}

function toggleDarkMode() {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute(
    "data-bs-theme",
    isDark.value ? "dark" : "light"
  );
}
</script>

<style scoped>
.login-wrap {
  --bg: var(--bs-body-bg);
  background: radial-gradient(
      1200px 600px at 10% 5%,
      rgba(13, 110, 253, 0.06),
      transparent 60%
    ),
    radial-gradient(
      900px 600px at 90% 105%,
      rgba(111, 66, 193, 0.06),
      transparent 60%
    ),
    var(--bg);
  padding: 24px;
}

/* Sağ üst tema butonu */
.theme-toggle-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: var(--border, rgba(0, 0, 0, 0.12));
}

.login-card {
  width: 100%;
  max-width: 560px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--card-bg, #fff);
}

.logo-container {
  display: flex;
  justify-content: center;
}
.logo-img {
  max-width: 300px;
  height: auto;
  display: block;
}

.invalid-hint {
  text-align: left;
}

.collapsible {
  overflow: hidden;
}
.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 260ms ease, opacity 220ms ease, transform 240ms ease,
    margin 220ms ease, padding 220ms ease;
}
.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.collapse-enter-to,
.collapse-leave-from {
  max-height: 200px;
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 160ms ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

:root[data-bs-theme="dark"] .login-card {
  --card-bg: rgba(33, 37, 41, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
