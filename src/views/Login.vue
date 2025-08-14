<template>
  <div
    class="login-wrap min-vh-100 d-flex align-items-center justify-content-center"
  >
    <!-- Theme toggle (fixed) -->
    <button
      class="btn btn-outline-secondary theme-toggle-btn"
      @click="toggleDarkMode"
      aria-label="Toggle dark mode"
    >
      <Sun v-if="!isDark" :size="18" />
      <Moon v-else :size="18" />
    </button>

    <div class="login-card shadow-apple">
      <div class="content-narrow">
        <!-- Logo -->
        <div class="logo-container mx-auto">
          <img
            :src="isDark ? darkLogo : lightLogo"
            alt="Alışan Logistics"
            class="logo-img"
          />
        </div>

        <!-- Error (no layout shift) -->
        <transition name="fade-fast">
          <div v-if="error" class="error-text" role="alert" aria-live="polite">
            {{ error }}
          </div>
        </transition>
        <div v-show="!error" class="error-placeholder" aria-hidden="true"></div>

        <form @submit.prevent>
          <!-- E-mail -->
          <div class="mb-3">
            <div class="input-with-action">
              <input
                ref="emailInputEl"
                v-model.trim="email"
                type="email"
                class="form-control form-control-xl pe-5"
                placeholder="E-mail"
                autocomplete="username"
                required
                autofocus
                inputmode="email"
                @keyup.enter="verifyEmail"
                :disabled="checkingEmail || loggingIn || emailVerified"
              />
              <button
                class="icon-btn"
                type="button"
                :disabled="
                  !email || checkingEmail || loggingIn || emailVerified
                "
                @click="verifyEmail"
                aria-label="Verify e-mail"
                title="Verify e-mail"
              >
                <span
                  v-if="checkingEmail"
                  class="spinner-border spinner-border-sm"
                />
                <ArrowRight v-else :size="20" />
              </button>
            </div>
          </div>

          <!-- Password -->
          <div class="mb-2 password-slot" :class="{ visible: emailVerified }">
            <div class="input-with-action">
              <input
                ref="passwordInputEl"
                v-model="password"
                type="password"
                class="form-control form-control-xl pe-5"
                placeholder="Password"
                autocomplete="current-password"
                required
                @keyup.enter="doLogin"
                :disabled="loggingIn || !emailVerified"
              />
              <button
                class="icon-btn"
                type="button"
                :disabled="!password || loggingIn || !emailVerified"
                @click="doLogin"
                aria-label="Submit password"
                title="Submit password"
              >
                <span
                  v-if="loggingIn"
                  class="spinner-border spinner-border-sm"
                />
                <ArrowRight v-else :size="20" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Sun, Moon, ArrowRight } from "lucide-vue-next";

import darkLogo from "@/assets/alışan logo.png";
import lightLogo from "@/assets/alışan logo açık.png";

const router = useRouter();
const route = useRoute();

const DEMO_EMAIL = "alisan@alisan.com";
const DEMO_PASS = "12345";

const email = ref("");
const password = ref("");
const emailVerified = ref(false);

const checkingEmail = ref(false);
const loggingIn = ref(false);
const error = ref("");

const emailInputEl = ref<HTMLInputElement | null>(null);
const passwordInputEl = ref<HTMLInputElement | null>(null);

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

async function verifyEmail() {
  error.value = "";
  if (!email.value) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email.value)) {
    error.value = "Please enter a valid e-mail format.";
    emailVerified.value = false;
    return;
  }

  checkingEmail.value = true;
  try {
    if (email.value.trim().toLowerCase() === DEMO_EMAIL) {
      emailVerified.value = true;
      await nextTick();
      passwordInputEl.value?.focus();
    } else {
      emailVerified.value = false;
      error.value = "Please enter a valid e-mail address.";
      await nextTick();
      emailInputEl.value?.focus();
    }
  } finally {
    checkingEmail.value = false;
  }
}

async function doLogin() {
  error.value = "";
  if (!emailVerified.value) {
    await verifyEmail();
    if (!emailVerified.value) return;
  }
  if (!password.value) return;

  loggingIn.value = true;
  try {
    if (password.value === DEMO_PASS) {
      localStorage.setItem("auth", "1");
      const target = (route.query.redirect as string) || "/dashboard";
      await router.replace(target);
    } else {
      error.value = "Invalid password.";
      await nextTick();
      passwordInputEl.value?.focus();
    }
  } finally {
    loggingIn.value = false;
  }
}
</script>

<style scoped>
/* Page bg */
.login-wrap {
  --bg: var(--bs-body-bg);
  background: radial-gradient(
      1200px 600px at 10% 5%,
      rgba(13, 109, 253, 0.18),
      transparent 60%
    ),
    radial-gradient(
      900px 600px at 90% 105%,
      rgba(111, 66, 193, 0.18),
      transparent 60%
    ),
    var(--bg);
  padding: 24px;
}

/* Theme button (fixed) */
.theme-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Center card — smaller, taller */
.login-card {
  width: min(900px, 88vw); /* biraz daralttık */
  min-height: 65vh; /* biraz uzattık */
  border-radius: 28px;
  background: var(--card-bg, #fff);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: clamp(20px, 3vw, 36px);
}

/* Shadow */
.shadow-apple {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 40px 120px rgba(0, 0, 0, 0.12);
}

/* Inner area */
.content-narrow {
  width: min(500px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 55vh;
}

/* Logo spacing */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 24px; /* logo ile form arasına daha sağlıklı boşluk */
  margin-top: -10px;
}
.logo-img {
  max-width: 300px;
  height: auto;
}

/* Error slot (sabit yükseklik) */
.error-text,
.error-placeholder {
  min-height: 22px;
  margin-bottom: 8px;
  text-align: center;
}
.error-text {
  color: #dc3545;
}

/* Inputs */
.form-control-xl {
  height: 56px;
  font-size: 1rem;
  border-radius: 12px;
}

/* Input + arrow */
.input-with-action {
  position: relative;
}
.icon-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary-color, #6c757d);
}
.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.icon-btn:hover:not(:disabled) {
  color: var(--bs-primary, #0d6efd);
}

/* Password reveal (no jump) */
.password-slot {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease;
}
.password-slot.visible {
  opacity: 1;
  visibility: visible;
}

/* Fade */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 160ms ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

/* Dark card */
:root[data-bs-theme="dark"] .login-card {
  --card-bg: rgba(33, 37, 41, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
