export const APPLICATIONS_KEY = "jhc_applications";
export const PROFILE_KEY = "jhc_profile";

export function loadLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Gagal membaca ${key}:`, e);
    return fallback;
  }
}

export function saveLocal(key, value) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Gagal menyimpan ${key}:`, e);
    return false;
  }
}
