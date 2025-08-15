<template>
  <div
    class="login-wrap min-vh-100 d-flex align-items-center justify-content-center"
  >
    <!-- Center card -->
    <div class="login-card shadow-apple">
      <div class="content-col">
        <!-- Top (logo + form) -->
        <div class="top-block">
          <div class="logo-container">
            <img :src="lightLogo" alt="Alışan Logistics" class="logo-img" />
          </div>

          <!-- Shared error/info row -->
          <div
            class="error-row"
            :class="{ show: !!error || !!resetInfo }"
            role="alert"
            aria-live="polite"
          >
            {{ error || resetInfo }}
          </div>

          <!-- LOGIN FORM -->
          <form
            v-if="mode === 'login'"
            @submit.prevent="doLogin"
            class="form-stack"
          >
            <!-- reset başlığı kadar yer tutan boşluk -->
            <div class="field heading-spacer" aria-hidden="true"></div>

            <!-- E-mail -->
            <div class="field">
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
            <div
              class="field field--reserve password-slot"
              :class="{ visible: emailVerified }"
            >
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

          <!-- RESET FORM -->
          <form v-else @submit.prevent="doReset" class="form-stack">
            <!-- login ile aynı yükseklikte başlık alanı -->
            <div class="field heading-spacer">
              <div class="reset-title">Reset your password</div>
            </div>

            <div class="field">
              <div class="input-with-action">
                <input
                  ref="resetEmailInputEl"
                  v-model.trim="resetEmail"
                  type="email"
                  class="form-control form-control-xl"
                  placeholder="Enter your e-mail"
                  autocomplete="username"
                  required
                  inputmode="email"
                  :disabled="resetting"
                />
              </div>
            </div>

            <!-- login'deki şifre satırının yüksekliğini dengeleyen boşluk -->
            <div class="field field--reserve" aria-hidden="true"></div>

            <!-- Aksiyon satırı: 20px yukarı ve e-mail satırıyla hizalı -->
            <div class="reset-actions">
              <button
                type="button"
                class="btn btn-link p-0 link-btn"
                @click="switchToLogin"
                :disabled="resetting"
              >
                ← Back to sign in
              </button>

              <button
                type="submit"
                class="btn btn-primary"
                :disabled="!resetEmail || resetting"
                aria-label="Send reset link"
                title="Send reset link"
              >
                <span
                  v-if="resetting"
                  class="spinner-border spinner-border-sm me-2"
                />
                Send reset link
              </button>
            </div>
          </form>
        </div>

        <!-- Bottom (extras) -->
        <div class="extras">
          <label class="stay d-inline-flex align-items-center gap-2">
            <input
              type="checkbox"
              class="form-check-input"
              v-model="isStayConnected"
            />
            <span>Stay connected</span>
          </label>

          <div class="links">
            <button type="button" class="link-btn" @click="switchToReset">
              Forgot password?
            </button>
            <a href="#" class="link">Create an identifier</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRight } from "lucide-vue-next";
import lightLogo from "@/assets/alışan logo açık.png";

const router = useRouter();
const route = useRoute();

const DEMO_EMAIL = "alisan@alisan.com";
const DEMO_PASS = "12345";

const mode = ref<"login" | "reset">("login");

const email = ref("");
const password = ref("");
const emailVerified = ref(false);

const checkingEmail = ref(false);
const loggingIn = ref(false);
const error = ref("");

const resetEmail = ref("");
const resetting = ref(false);
const resetInfo = ref("");

const emailInputEl = ref<HTMLInputElement | null>(null);
const passwordInputEl = ref<HTMLInputElement | null>(null);
const resetEmailInputEl = ref<HTMLInputElement | null>(null);

const isStayConnected = ref(false);

function switchToReset() {
  error.value = "";
  resetInfo.value = "";
  mode.value = "reset";
  resetEmail.value = email.value || "";
  nextTick(() => resetEmailInputEl.value?.focus());
}
function switchToLogin() {
  error.value = "";
  resetInfo.value = "";
  mode.value = "login";
  nextTick(() =>
    emailVerified.value
      ? passwordInputEl.value?.focus()
      : emailInputEl.value?.focus()
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

async function doReset() {
  error.value = "";
  resetInfo.value = "";
  if (!resetEmail.value) return;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(resetEmail.value)) {
    error.value = "Please enter a valid e-mail format.";
    return;
  }
  resetting.value = true;
  try {
    await new Promise((r) => setTimeout(r, 800));
    resetInfo.value =
      "If an account exists for this e-mail, a reset link has been sent.";
  } finally {
    resetting.value = false;
  }
}
</script>

<style scoped>
/* ===== Global background: beyaz + çok hafif görsel ===== */
.login-wrap {
  background-color: #fff;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.88),
      rgba(255, 255, 255, 0.88)
    ),
    url("@/assets/1 1.jpg");
  background-size: cover;
  background-position: center;
  padding: 24px;
}

/* ===== Kart ===== */
.login-card {
  position: relative;
  width: clamp(360px, 92vw, 760px);
  height: clamp(560px, 80vh, 860px);
  border-radius: 28px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: clamp(16px, 4vw, 40px);
  display: flex;
  align-items: stretch;
  overflow: hidden;

  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}
.shadow-apple {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 40px 120px rgba(0, 0, 0, 0.12);
}

/* ===== İç kolon ===== */
.content-col {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 100%;
}

/* ===== ÜST BLOK ===== */
.top-block {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}
.logo-container {
  display: flex;
  justify-content: center;
  margin: 0 0 clamp(16px, 2.8vh, 24px) 0;
}
.logo-img {
  width: min(360px, 80%);
  height: auto;
  object-fit: contain;
}

/* ===== Hata / Bilgi ===== */
.error-row {
  min-height: 20px;
  text-align: center;
  color: #dc3545;
  visibility: hidden;
  margin: 8px 0 12px 0;
}
.error-row.show {
  visibility: visible;
}

/* ===== Formlar ===== */
.form-stack {
  display: grid;
  gap: 15px;
  width: 100%;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

:root {
  --row-h: clamp(48px, 6.4vh, 56px);
  --heading-h: clamp(28px, 4vh, 32px);
}
.field {
  display: block;
}
.heading-spacer {
  height: var(--heading-h);
  display: flex;
  align-items: center;
  justify-content: center;
}
.reset-title {
  font-weight: 600;
  font-size: clamp(1rem, 1.6vw, 1.125rem);
  text-align: center;
}
.field--reserve {
  height: var(--row-h);
  overflow: hidden;
}
.field--reserve .input-with-action {
  height: 100%;
  display: flex;
  align-items: center;
}

.password-slot {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}
.password-slot.visible {
  opacity: 1;
  visibility: visible;
}

/* Inputlar */
.form-control-xl {
  height: var(--row-h);
  font-size: clamp(0.95rem, 1.8vw, 1rem);
  border-radius: 14px;
  border-width: 2px;
  border-color: rgba(0, 0, 0, 0.18);
}
.form-control-xl:focus {
  border-color: #7aa8ff;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

/* Input içi ikon buton */
.input-with-action {
  position: relative;
}
.icon-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}
.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.icon-btn:hover:not(:disabled) {
  color: #0d6efd;
}

/* ===== Aksiyon satırı: 20px yukarı ve hizalı ===== */
.reset-actions {
  margin-top: -20px; /* 20px yukarı taşı */
  display: flex;
  align-items: center; /* e-mail input yüksekliğiyle hizala */
  justify-content: space-between; /* solda link, sağda buton */
  min-height: var(--row-h); /* input satırıyla aynı yükseklik */
}

/* ===== ALT BLOK ===== */
.extras {
  flex: 0 0 auto;
  padding-top: clamp(12px, 2.4vh, 24px);
  text-align: center;
}
.stay {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* Checkbox stili (tik siyah) */
.form-check-input {
  width: 1.05rem;
  height: 1.05rem;
  appearance: none;
  border: 2px solid rgba(0, 0, 0, 0.4);
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.2s ease;
}
.form-check-input:hover {
  border-color: #0d6efd;
}
.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='black' viewBox='0 0 16 16'%3E%3Cpath d='M13.854 3.646a.5.5 0 0 1 0 .708L6.707 11.5 3.146 7.854a.5.5 0 1 1 .708-.708L6.707 10.293l6.439-6.647a.5.5 0 0 1 .708 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 0.7rem 0.7rem;
}

.links {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.link {
  font-size: 0.9rem;
  text-decoration: none;
  color: #0d6efd;
}
.link:hover {
  text-decoration: underline;
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: #0d6efd;
  text-decoration: none;
  cursor: pointer;
}
.link-btn:hover {
  text-decoration: underline;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .login-card {
    height: auto;
    min-height: 84vh;
    padding: 16px;
    border-radius: 22px;
  }
  .logo-img {
    width: min(280px, 82%);
  }
}
@media (max-width: 380px) {
  .login-card {
    width: 94vw;
    padding: 14px;
  }
  .form-control-xl {
    height: 46px;
    font-size: 0.95rem;
  }
  .icon-btn {
    right: 6px;
  }
  .reset-actions {
    margin-top: -12px;
    min-height: 46px;
  } /* çok küçük ekran ayarı */
}
.send-reset-btn {
  padding: 8px 16px;
  margin-left: 4px; /* hafif kaydırma */
}
</style>
