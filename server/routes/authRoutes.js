const {
  authLimiter,
  passwordResetLimiter,
} = require("../middleware/rateLimiter");

const {
  validateRegister,
  validateLogin,
  validateUpdate,
  checkOldPassword,
  checkNewPassword,
} = require("../middleware/validateUser");

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");

const {
  createUser,
  loginUser,
  signOut,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { deleteUser } = require("../controllers/deleteController");
const {
  updatePassword,
  verifyOldPassword,
} = require("../controllers/updatePassword");
const { updateUser } = require("../controllers/updateUserController");

const express = require("express");
const router = express.Router();

// 🔐 Auth routes
router.route("/register").post(authLimiter, validateRegister, createUser);
router.route("/login").post(authLimiter, validateLogin, loginUser);
router.route("/signout").post(authLimiter, authenticate, signOut);

// ✅ Forgot password routes
router.route("/forgot-password").post(passwordResetLimiter, forgotPassword);
router
  .route("/reset-password/:token")
  .post(passwordResetLimiter, resetPassword);

// 🔑 Password routes
router
  .route("/password")
  .post(
    passwordResetLimiter,
    authenticate,
    authorize("admin", "user"),
    checkOldPassword,
    verifyOldPassword,
  )
  .put(
    passwordResetLimiter,
    authenticate,
    authorize("admin", "user"),
    checkNewPassword,
    updatePassword,
  );

// 👤 User routes
router
  .route("/")
  .put(
    authLimiter,
    authenticate,
    authorize("admin", "user"),
    validateUpdate,
    updateUser,
  )
  .delete(authLimiter, authenticate, authorize("admin", "user"), deleteUser) // ✅ id from cookie
  .get((req, res) => res.status(200).send("Well done champ"));

module.exports = router;
