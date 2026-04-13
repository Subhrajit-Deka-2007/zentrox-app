// ============================================
// auth.js
// ============================================

const auth = {
  init() {
    this.setupLogin();
    this.setupRegister();
    this.setupForgotPassword();
    this.setupResetPassword();
    this.setupLinks();
  },

  setupLogin() {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email    = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) { toast.show("Please fill in all fields", "error"); return; }

      const btn = document.getElementById("login-btn");
      btn.textContent = "Signing in...";
      btn.disabled = true;

      try {
        const res = await authAPI.login({ email, password });
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.show("Welcome back!", "success");
        router.go("feed");
      } catch (err) {
        toast.show(getError(err, "Login failed"), "error");
      }

      btn.textContent = "Sign In";
      btn.disabled = false;
    });
  },

  setupRegister() {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name            = document.getElementById("reg-name").value.trim();
      const city            = document.getElementById("reg-city").value.trim();
      const email           = document.getElementById("reg-email").value.trim();
      const phone           = document.getElementById("reg-phone").value.trim();
      const dob             = document.getElementById("reg-dob").value;
      const password        = document.getElementById("reg-password").value;
      const confirmPassword = document.getElementById("reg-confirm").value;

      if (!name || !city || !email || !phone || !dob || !password || !confirmPassword) {
        toast.show("Please fill in all fields", "error"); return;
      }
      if (password !== confirmPassword) {
        toast.show("Passwords do not match", "error"); return;
      }

      const btn = document.getElementById("register-btn");
      btn.textContent = "Creating account...";
      btn.disabled = true;

      try {
        const res = await authAPI.register({ name, city, email, phone, dob, password, confirmPassword });
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.show("Account created! Check your email 📧", "success");
        router.go("feed");
      } catch (err) {
        toast.show(getError(err, "Registration failed"), "error");
      }

      btn.textContent = "Create Account";
      btn.disabled = false;
    });
  },

  setupForgotPassword() {
    document.getElementById("forgot-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("forgot-email").value.trim();
      if (!email) { toast.show("Please enter your email", "error"); return; }

      const btn = document.getElementById("forgot-btn");
      btn.textContent = "Sending...";
      btn.disabled = true;

      try {
        await authAPI.forgotPassword(email);
        document.getElementById("forgot-step-1").classList.add("hidden");
        document.getElementById("forgot-step-2").classList.remove("hidden");
        document.getElementById("forgot-sent-to").textContent = email;
      } catch (err) {
        toast.show(getError(err, "Failed to send email"), "error");
      }

      btn.textContent = "Send Reset Token";
      btn.disabled = false;
    });
  },

  setupResetPassword() {
    document.getElementById("reset-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const token           = document.getElementById("reset-token").value.trim();
      const password        = document.getElementById("reset-password").value;
      const confirmPassword = document.getElementById("reset-confirm").value;

      if (!token) { toast.show("Please paste your reset token", "error"); return; }
      if (!password || !confirmPassword) { toast.show("Please fill in all fields", "error"); return; }
      if (password !== confirmPassword) { toast.show("Passwords do not match", "error"); return; }

      const btn = document.getElementById("reset-btn");
      btn.textContent = "Resetting...";
      btn.disabled = true;

      try {
        await authAPI.resetPassword(token, { password, confirmPassword });
        document.getElementById("reset-step-1").classList.add("hidden");
        document.getElementById("reset-step-2").classList.remove("hidden");
      } catch (err) {
        toast.show(getError(err, "Failed to reset password"), "error");
      }

      btn.textContent = "Reset Password";
      btn.disabled = false;
    });
  },

  setupLinks() {
    document.getElementById("go-register").addEventListener("click", (e) => { e.preventDefault(); router.go("register"); });
    document.getElementById("go-forgot").addEventListener("click",   (e) => { e.preventDefault(); router.go("forgot"); });
    document.getElementById("go-login").addEventListener("click",    (e) => { e.preventDefault(); router.go("login"); });
    document.getElementById("go-login-2").addEventListener("click",  (e) => { e.preventDefault(); router.go("login"); });
    document.getElementById("go-reset-btn").addEventListener("click",  () => router.go("reset"));
    document.getElementById("go-forgot-2").addEventListener("click", (e) => { e.preventDefault(); router.go("forgot"); });
    document.getElementById("go-login-3").addEventListener("click",    () => router.go("login"));
  },
};
