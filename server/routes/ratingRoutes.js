const { deleteRating } = require("../controllers/deleteController");
const { createRating ,updateRating} = require("../controllers/ratingController");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { apiLimiter } = require("../middleware/rateLimiter");
const { validatePId, validateRID } = require("../middleware/validateId");
const { validRating } = require("../middleware/validateRating");
const express = require('express');
const router = express.Router();
router
  .route("/:pid/rating/:rid")
  .put(
    apiLimiter,
    authenticate,
    authorize("admin", "user"),
    validatePId,
    validateRID,
    validRating,
    updateRating,
  )
  .delete(
    apiLimiter,
    authenticate,
    validatePId,
    validateRID,
    authorize("admin", "user"),
    deleteRating,
  );
router
  .route("/:pid/rating")
  .post(
    apiLimiter,
    authenticate,
    validatePId,
    authorize("admin", "user"),
    validRating,
    createRating,
);
module.exports = router;