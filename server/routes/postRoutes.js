const { deletePost } = require("../controllers/deleteController");
const { updatePost, createPost } = require("../controllers/postController");
const { getAllPost } = require("../controllers/sendPosts");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { apiLimiter } = require("../middleware/rateLimiter");
const { validatePId } = require("../middleware/validateId");
const { validatePagination } = require("../middleware/validatePage");
const { uploadImage } = require("../middleware/upload"); // ✅ added

const {
  validateCreatePost,
  validateUpdatePost,
} = require("../middleware/validatePost");

const express = require("express");
const router = express.Router();

// 📌 Post by ID
router
  .route("/:pid")
    .put(
      apiLimiter,
      authenticate,
      validatePId,
      authorize("admin", "user"),
      uploadImage, // ✅ add here — handles optional image update
      validateUpdatePost,
      updatePost,
    )
    .delete(
      apiLimiter,
      authenticate,
      validatePId,
      authorize("admin", "user"),
      deletePost,
    );

// 📌 All posts
router
  .route("/")
  .post(
    apiLimiter,
    authenticate,
    authorize("admin", "user"),
    uploadImage, // ✅ multer runs first — saves image to disk
    validateCreatePost, // ✅ then validate title and description
    createPost, // ✅ then create post
  )
  .get(apiLimiter, validatePagination, getAllPost);

module.exports = router;
