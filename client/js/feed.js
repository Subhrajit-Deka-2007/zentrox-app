// ============================================
// feed.js
// Cards: image, title, desc, read-only stats
// Ratings + comments only on post detail page
// ============================================

const feed = {
  currentPage: 1,
  editingPostId: null,
  selectedFile: null,

  async loadPosts(page = 1) {
    this.currentPage = page;
    const container = document.getElementById("posts-container");
    container.innerHTML = '<div class="state-msg">Loading posts...</div>';

    try {
      const res      = await postsAPI.getAll(page);
      const postList = res.data.post || [];
      const total    = res.data.pagination?.totalPosts || postList.length;

      document.getElementById("post-count").textContent = `${total} posts`;

      if (postList.length === 0) {
        container.innerHTML = '<div class="state-msg">No posts yet! Create the first one!</div>';
        return;
      }

      container.innerHTML = `
        <div class="posts-grid">
          ${postList.map((post) => this.renderCard(post)).join("")}
        </div>
      `;

      this.bindCardEvents(postList);
    } catch (err) {
      console.error("Load posts error:", err);
      container.innerHTML = '<div class="state-msg">Failed to load posts. Please login first.</div>';
    }
  },

  bindCardEvents(postList) {
    postList.forEach((post) => {
      const card = document.getElementById(`post-${post._id}`);
      if (!card) return;

      card.addEventListener("click", () => router.go("post-detail", post));

      card.querySelector("[data-action='edit']")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openEditModal(post._id, post.title, post.description, post.imageUrl || "");
      });

      card.querySelector("[data-action='delete']")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deletePost(post._id);
      });
    });
  },

  renderCard(post) {
    const user      = JSON.parse(localStorage.getItem("user") || "{}");
    const isOwner   = post.owner?._id === user._id || post.owner === user._id;
    const isAdmin   = user.role === "admin";
    const canDelete = isOwner || isAdmin;

    const fallback =
      "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23333%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23888%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22%3ENo Image%3C/text%3E%3C/svg%3E";

    const avgRating = post.ratings?.length
      ? (post.ratings.reduce((sum, r) => sum + r.rate, 0) / post.ratings.length).toFixed(1)
      : null;

    return `
      <div class="post-card" id="post-${post._id}" style="cursor:pointer;">
        <img
          src="${post.imageUrl || fallback}"
          alt="${post.title}"
          onerror="this.onerror=null; this.src='${fallback}'"
        />
        <div class="post-card-body">
          <div class="post-card-title">${post.title}</div>
          <div class="post-card-desc">${post.description}</div>
          <div style="display:flex; gap:16px; margin-top:8px;">
            <span style="font-size:13px; color:#666;">⭐ ${avgRating ? `${avgRating} / 5` : "No ratings"}</span>
            <span style="font-size:13px; color:#666;">💬 ${post.comments?.length || 0} comment${post.comments?.length === 1 ? "" : "s"}</span>
          </div>
          ${canDelete ? `
            <div class="post-card-actions" style="margin-top:12px;">
              ${isOwner ? `<button class="btn btn-ghost" data-action="edit">✏️ Edit</button>` : ""}
              <button class="btn btn-ghost" style="color:#ff4757;" data-action="delete">🗑️ Delete</button>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  },

  openCreateModal() {
    this.editingPostId = null;
    this.selectedFile  = null;
    document.getElementById("modal-title").textContent     = "Create Post";
    document.getElementById("submit-post-btn").textContent = "Publish";
    document.getElementById("post-title").value            = "";
    document.getElementById("post-description").value      = "";
    document.getElementById("post-image").value            = "";
    document.getElementById("upload-placeholder").classList.remove("hidden");
    document.getElementById("upload-preview").classList.add("hidden");
    document.getElementById("preview-img").src             = "";
    document.getElementById("post-modal").classList.remove("hidden");
  },

  openEditModal(pid, title, description, imageUrl) {
    this.editingPostId = pid;
    this.selectedFile  = null;
    document.getElementById("modal-title").textContent     = "Edit Post";
    document.getElementById("submit-post-btn").textContent = "Update";
    document.getElementById("post-title").value            = title;
    document.getElementById("post-description").value      = description;
    document.getElementById("preview-img").src             = imageUrl;
    document.getElementById("upload-placeholder").classList.add("hidden");
    document.getElementById("upload-preview").classList.remove("hidden");
    document.getElementById("post-modal").classList.remove("hidden");
  },

  closeModal() {
    document.getElementById("post-modal").classList.add("hidden");
    this.editingPostId = null;
    this.selectedFile  = null;
  },

  async submitPost() {
    const title       = document.getElementById("post-title").value.trim();
    const description = document.getElementById("post-description").value.trim();
    const btn         = document.getElementById("submit-post-btn");

    if (!title || !description) { toast.show("Title and description are required", "error"); return; }
    if (!this.editingPostId && !this.selectedFile) { toast.show("Please select an image", "error"); return; }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (this.selectedFile) formData.append("image", this.selectedFile);

    btn.textContent = "Saving...";
    btn.disabled    = true;

    try {
      if (this.editingPostId) {
        await postsAPI.update(this.editingPostId, formData);
        toast.show("Post updated!", "success");
      } else {
        await postsAPI.create(formData);
        toast.show("Post published!", "success");
      }
      this.closeModal();
      await this.loadPosts(this.currentPage);
    } catch (err) {
      toast.show(getError(err, "Failed to save post"), "error");
    }

    btn.textContent = this.editingPostId ? "Update" : "Publish";
    btn.disabled    = false;
  },

  async deletePost(pid) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await postsAPI.delete(pid);
      toast.show("Post deleted", "success");
      await this.loadPosts(this.currentPage);
    } catch (err) {
      toast.show(getError(err, "Failed to delete post"), "error");
    }
  },

  setupImageUpload() {
    document.getElementById("post-image").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById("preview-img").src = ev.target.result;
        document.getElementById("upload-placeholder").classList.add("hidden");
        document.getElementById("upload-preview").classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    });
  },

  init() {
    this.setupImageUpload();
    document.getElementById("modal-close-btn").addEventListener("click",  () => this.closeModal());
    document.getElementById("modal-cancel-btn").addEventListener("click", () => this.closeModal());
    document.getElementById("submit-post-btn").addEventListener("click",  () => this.submitPost());
  },
};
