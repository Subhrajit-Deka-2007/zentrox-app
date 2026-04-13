// ============================================
// post.js
// Ratings + comments ONLY shown here
// Delete: owner or admin
// ============================================

const postDetail = {
  currentPost: null,

  async load(post) {
    if (!post) {
      document.getElementById("post-detail-container").innerHTML =
        '<div class="state-msg">Post not found.</div>';
      return;
    }

    this.currentPost = post;
    const container = document.getElementById("post-detail-container");
    const user      = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin   = user.role === "admin";
    const isOwner   = post.owner?._id === user._id || post.owner === user._id;
    const canModify = isOwner || isAdmin;

    const fallback =
      "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22225%22%3E%3Crect width=%22400%22 height=%22225%22 fill=%22%23333%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23888%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22sans-serif%22%3ENo Image%3C/text%3E%3C/svg%3E";

    const userRating = (post.ratings || []).find(
      (r) => r.owner?._id === user._id || r.owner === user._id,
    );
    const avgRating = post.ratings?.length
      ? (post.ratings.reduce((sum, r) => sum + r.rate, 0) / post.ratings.length).toFixed(1)
      : null;

    container.innerHTML = `
      <div class="post-detail">
        <img src="${post.imageUrl || fallback}" alt="${post.title}"
          onerror="this.onerror=null; this.src='${fallback}'" />
        <div class="post-detail-body">
          <div class="post-detail-title">${post.title}</div>
          <div class="post-detail-desc">${post.description}</div>

          ${canModify ? `
            <div class="post-card-actions" style="margin-bottom:24px;">
              ${isOwner ? `<button class="btn btn-ghost" id="detail-edit-btn">✏️ Edit</button>` : ""}
              <button class="btn btn-ghost" style="color:#ff4757" id="detail-delete-btn">🗑️ Delete Post</button>
            </div>
          ` : ""}

          <div class="rating-section">
            <span>${avgRating ? `⭐ ${avgRating} / 5 (${post.ratings.length} ratings)` : "No ratings yet"}</span>
            ${!userRating ? `
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
                ${[1,2,3,4,5].map((n) => `
                  <button class="btn btn-ghost detail-rate-btn" data-rate="${n}">${n}⭐</button>
                `).join("")}
              </div>
            ` : `
              <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
                <span style="color:#2ed573;">You rated ${userRating.rate}⭐</span>
                <button class="btn btn-ghost" style="color:#ff4757; font-size:12px;"
                  id="detail-remove-rating-btn" data-rid="${userRating._id}">🗑️ Remove</button>
              </div>
            `}
          </div>

          <div class="comment-section">
            <div class="comment-input-row">
              <input type="text" id="detail-comment-input" placeholder="Write a comment..." class="comment-input" />
              <button class="btn btn-ghost" id="detail-comment-btn">💬 Comment</button>
            </div>
            <div id="detail-comments-list">
              ${(post.comments || []).map((c) => this.renderComment(c, user, isAdmin)).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(isOwner, isAdmin);
  },

  bindEvents(isOwner, isAdmin) {
    document.getElementById("detail-edit-btn")?.addEventListener("click", () => {
      const p = this.currentPost;
      feed.openEditModal(p._id, p.title, p.description, p.imageUrl || "");
    });

    document.getElementById("detail-delete-btn")?.addEventListener("click", () => {
      this.deletePost(this.currentPost._id);
    });

    document.querySelectorAll(".detail-rate-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.submitRating(parseInt(btn.dataset.rate)));
    });

    document.getElementById("detail-remove-rating-btn")?.addEventListener("click", (e) => {
      this.deleteRating(e.currentTarget.dataset.rid);
    });

    document.getElementById("detail-comment-btn")?.addEventListener("click", () => this.submitComment());

    document.getElementById("detail-comment-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.submitComment();
    });

    document.querySelectorAll(".detail-delete-comment-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.deleteComment(btn.dataset.cid));
    });
  },

  renderComment(comment, user, isAdmin) {
    const isOwner   = comment.owner?._id === user._id || comment.owner === user._id;
    const canDelete = isOwner || isAdmin;
    return `
      <div class="comment" id="comment-${comment._id}">
        <span class="comment-author">${comment.owner?.name || "User"}:</span>
        <span class="comment-text">${comment.text}</span>
        ${canDelete ? `
          <button class="btn btn-ghost detail-delete-comment-btn"
            style="color:#ff4757; font-size:12px;" data-cid="${comment._id}">🗑️</button>
        ` : ""}
      </div>
    `;
  },

  async submitComment() {
    const input = document.getElementById("detail-comment-input");
    const text  = input.value.trim();
    if (!text) { toast.show("Please write a comment", "error"); return; }
    try {
      await commentsAPI.create(this.currentPost._id, text);
      input.value = "";
      toast.show("Comment added!", "success");
      await this.refresh();
    } catch (err) {
      toast.show(getError(err, "Failed to add comment"), "error");
    }
  },

  async deleteComment(cid) {
    if (!confirm("Delete this comment?")) return;
    try {
      await commentsAPI.delete(this.currentPost._id, cid);
      toast.show("Comment deleted", "success");
      await this.refresh();
    } catch (err) {
      toast.show(getError(err, "Failed to delete comment"), "error");
    }
  },

  async submitRating(rate) {
    try {
      await ratingsAPI.create(this.currentPost._id, rate);
      toast.show(`Rated ${rate}⭐`, "success");
      await this.refresh();
    } catch (err) {
      toast.show(getError(err, "Failed to submit rating"), "error");
    }
  },

  async deleteRating(rid) {
    if (!confirm("Remove your rating?")) return;
    try {
      await ratingsAPI.delete(this.currentPost._id, rid);
      toast.show("Rating removed", "success");
      await this.refresh();
    } catch (err) {
      toast.show(getError(err, "Failed to remove rating"), "error");
    }
  },

  async deletePost(pid) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await postsAPI.delete(pid);
      toast.show("Post deleted", "success");
      router.go("feed");
    } catch (err) {
      toast.show(getError(err, "Failed to delete post"), "error");
    }
  },

  async refresh() {
    try {
      const res     = await postsAPI.getOne(this.currentPost._id);
      const updated = res.data.post || res.data;
      if (updated) await this.load(updated);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  },

  init() {
    document.getElementById("back-to-feed-btn").addEventListener("click", () => router.go("feed"));
  },
};
