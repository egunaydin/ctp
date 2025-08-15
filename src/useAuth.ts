// src/useAuth.ts
import { ref, computed } from "vue";

const AUTH_USER_KEY = "authUser";
const AUTH_FLAG_KEY = "auth";

export type User = { name: string; email: string } | null;

function bootUser(): User {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const _user = ref<User>(bootUser());
const _isAuthed = computed(() => !!_user.value);

const DEMO_EMAIL = "alisan@alisan.com";
const DEMO_PASS = "12345";

export async function login(email: string, password: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 250));

  const e = (email || "").trim().toLowerCase();
  const p = (password || "").trim();

  const ok = e === DEMO_EMAIL && p === DEMO_PASS;
  if (!ok) return false;

  const u = { name: "Ensar Günaydın", email: DEMO_EMAIL };
  _user.value = u;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
  localStorage.setItem(AUTH_FLAG_KEY, "1");
  return true;
}

export function logout() {
  _user.value = null;
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_FLAG_KEY);
}

const _initials = computed(() => {
  const n = _user.value?.name?.trim() ?? "";
  if (!n) return "";
  return n
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0]!)
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

export function useAuth() {
  return {
    user: _user,
    isAuthenticated: _isAuthed,
    initials: _initials,
    login,
    logout,
  };
}
