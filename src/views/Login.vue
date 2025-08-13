<template>
  <div
    class="login-wrap min-vh-100 d-flex align-items-center justify-content-center position-relative"
  >
    <!-- Tema değiştirme: sağ üst -->
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

      <!-- Hata (logo altında) -->
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

      <!-- Form (submit yok; enter kısayolu için prevent) -->
      <form @submit.prevent>
        <!-- E-mail -->
        <div class="mb-3">
          <label class="form-label fs-6">E-mail</label>
          <div class="input-with-action">
            <input
              ref="emailInputEl"
              v-model.trim="email"
              type="email"
              class="form-control form-control-lg pe-5"
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
              :disabled="!email || checkingEmail || loggingIn || emailVerified"
              @click="verifyEmail"
              aria-label="Verify e-mail"
              title="Verify e-mail"
            >
              <span
                v-if="checkingEmail"
                class="spinner-border spinner-border-sm"
              />
              <ArrowRight v-else :size="18" />
            </button>
          </div>
        </div>

        <!-- Password (yer her zaman hazır; görünürlük toggle) -->
        <div class="mb-1 password-slot" :class="{ visible: emailVerified }">
          <label class="form-label fs-6">Password</label>
          <div class="input-with-action">
            <input
              ref="passwordInputEl"
              v-model="password"
              type="password"
              class="form-control form-control-lg pe-5"
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
              <span v-if="loggingIn" class="spinner-border spinner-border-sm" />
              <ArrowRight v-else :size="18" />
            </button>
          </div>
        </div>
        <!-- Not: Login butonu yok; şifre yanındaki ok ile giriş yapılır -->
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Sun, Moon, ArrowRight } from "lucide-vue-next";

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

/** 1) E-mail doğrulama (DEMO): sadece alisan@alisan.com kabul */
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
    const normalized = email.value.trim().toLowerCase();
    if (normalized === DEMO_EMAIL) {
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

/** 2) Şifre doğrulama (DEMO) ve otomatik giriş */
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
/* Arka plan */
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
}

/* Kart */
.login-card {
  width: 100%;
  max-width: 560px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--card-bg, #fff);
}

/* Logo */
.logo-container {
  display: flex;
  justify-content: center;
}
.logo-img {
  max-width: 340px;
  height: auto;
  display: block;
}

/* Input + ok butonu aynı kapsayıcıda */
.input-with-action {
  position: relative;
}
.icon-btn {
  position: absolute;
  right: 10px;
  top: 50%; /* her zaman input'un tam ortası */
  transform: translateY(-50%);
  border: none;
  background: transparent;
  padding: 6px;
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

/* Hata metni */
.invalid-hint {
  text-align: left;
}

/* Parola alanı her zaman yer kaplar (kart büyümesin) */
.password-slot {
  opacity: 0;
  visibility: hidden;
  height: 92px; /* label + input yüksekliği */
  transition: opacity 0.25s ease;
}
.password-slot.visible {
  opacity: 1;
  visibility: visible;
}

/* Fade animasyonu */
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 160ms ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

/* Karanlık tema */
:root[data-bs-theme="dark"] .login-card {
  --card-bg: rgba(33, 37, 41, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
