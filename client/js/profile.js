// ============================================
// profile.js
// ============================================

const profile = {

  load() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name)  document.getElementById("update-name").value  = user.name;
    if (user.city)  document.getElementById("update-city").value  = user.city;
    if (user.phone) document.getElementById("update-phone").value = user.phone;
    if (user.dob)   document.getElementById("update-dob").value   = user.dob.split("T")[0];
  },

  async updateProfile() {
    const data  = {};
    const name  = document.getElementById("update-name").value.trim();
    const city  = document.getElementById("update-city").value.trim();
    const phone = document.getElementById("update-phone").value.trim();
    const dob   = document.getElementById("update-dob").value;

    if (name)  data.name  = name;
    if (city)  data.city  = city;
    if (phone) data.phone = phone;
    if (dob)   data.dob   = dob;

    if (Object.keys(data).length === 0) { toast.show("No changes to save", "error"); return; }

    const btn = document.getElementById("update-profile-btn");
    btn.textContent = "Saving...";
    btn.disabled    = true;

    try {
      await authAPI.updateProfile(data);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...data }));
      toast.show("Profile updated!", "success");
    } catch (err) {
      toast.show(getError(err, "Failed to update profile"), "error");
    }

    btn.textContent = "Save Changes";
    btn.disabled    = false;
  },

  async changePassword() {
    const oldPassword        = document.getElementById("old-password").value;
    const newPassword        = document.getElementById("new-password").value;
    const confirmNewPassword = document.getElementById("confirm-new-password").value;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.show("Please fill in all password fields", "error"); return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.show("New passwords do not match", "error"); return;
    }

    const btn = document.getElementById("change-password-btn");
    btn.textContent = "Updating...";
    btn.disabled    = true;

    try {
      await authAPI.verifyOldPassword({ oldPassword });
      await authAPI.updatePassword({ password: newPassword, confirmPassword: confirmNewPassword });
      document.getElementById("old-password").value         = "";
      document.getElementById("new-password").value         = "";
      document.getElementById("confirm-new-password").value = "";
      toast.show("Password updated!", "success");
    } catch (err) {
      toast.show(getError(err, "Failed to update password"), "error");
    }

    btn.textContent = "Update Password";
    btn.disabled    = false;
  },

  init() {
    document.getElementById("update-profile-btn").addEventListener("click",  () => this.updateProfile());
    document.getElementById("change-password-btn").addEventListener("click", () => this.changePassword());
  },
};
