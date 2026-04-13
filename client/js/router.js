// ============================================
// router.js
// PURPOSE: Navigation between pages
// ============================================

const router = {

  authPages: ["login", "register", "forgot", "reset"],

  go(pageId, data = null) {

    // hide all pages
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.add("hidden");
    });

    // show target page
    document.getElementById(pageId + "-page").classList.remove("hidden");

    // show/hide navbar
    const navbar = document.getElementById("navbar");
    if (this.authPages.includes(pageId)) {
      navbar.classList.add("hidden");
    } else {
      navbar.classList.remove("hidden");
    }

    // page-specific logic
    if (pageId === "feed")        feed.loadPosts();
    if (pageId === "profile")     profile.load();
    if (pageId === "post-detail") postDetail.load(data);
  },
};
