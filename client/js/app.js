// ============================================
// app.js — runs LAST
// ============================================

// ============================================
// ERROR HELPER
// Reads err.e first (validation errors from backend)
// then falls back to err.message
// ============================================
const getError = (err, fallback = "Something went wrong") => {
  const data = err.response?.data;
  if (!data) return fallback;
  if (data.e && typeof data.e === "string" && data.e.trim()) return data.e;
  if (data.e && typeof data.e === "object") return Object.values(data.e).join(", ");
  return data.message || fallback;
};

// ============================================
// TOAST
// ============================================
const toast = {
  show(message, type = "info", duration = 3000) {
    const container = document.getElementById("toast-container");
    const el        = document.createElement("div");
    el.className    = `toast ${type}`;
    el.textContent  = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity    = "0";
      el.style.transition = "opacity 0.3s";
      setTimeout(() => el.remove(), 300);
    }, duration);
  },
};

// ============================================
// START APP
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  auth.init();
  feed.init();
  profile.init();
  postDetail.init();

  document.getElementById("feed-btn").addEventListener("click",     () => router.go("feed"));
  document.getElementById("profile-btn").addEventListener("click",  () => router.go("profile"));
  document.getElementById("new-post-btn").addEventListener("click", () => feed.openCreateModal());

  document.getElementById("signout-btn").addEventListener("click", async () => {
    try { await authAPI.signout(); } catch (_) {}
    localStorage.removeItem("user");
    router.go("login");
  });

  const user = localStorage.getItem("user");
  router.go(user ? "feed" : "login");
});
