const { apiLimiter } = require("../middleware/rateLimiter");

const {
  validateCreateComment,
  validateUpdateComment,
} = require("../middleware/validateComment"); // ✅ FIXED

const authenticate = require("../middleware/authenticate");
const { validateCID, validatePId } = require("../middleware/validateId");

const {
  createComment,
  updateComment,
} = require("../controllers/commentController");

const { deleteComment } = require("../controllers/deleteController");

const express = require("express");
const authorize = require("../middleware/authorize");

const router = express.Router({ mergeParams: true });

// ✅ CREATE COMMENT
router.route("/:pid/comment").post(
  apiLimiter,
  authenticate,
  validatePId,
  authorize("admin", "user"),
  validateCreateComment, // ✅ FIXED
  createComment,
);

// ✅ UPDATE + DELETE COMMENT
router
  .route("/:pid/comment/:cid")
  .put(
    apiLimiter,
    authenticate,
    validatePId,
    validateCID,
    authorize("admin", "user"),
    validateUpdateComment, // ✅ FIXED
    updateComment,
  )
  .delete(
    apiLimiter,
    authenticate,
    validatePId,
    validateCID,
    authorize("admin", "user"),
    deleteComment,
  );

module.exports = router;
