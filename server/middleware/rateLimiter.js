const rateLimit = require("express-rate-limit");

// ✅ auth routes — login, register
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes ✅
  message: "Too many login attempts! Try again after 15 minutes",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ general API routes
exports.apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour ✅ fixed
  max: 1000, // 1000 requests per hour
  message: "API limit exceeded! Please try again after 1 hour!",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ password reset — very strict
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // only 3 attempts per hour ✅ fixed
  message: "Too many password reset attempts! Try again after 1 hour!",
  skipSuccessfulRequests: false, // ✅ count all attempts including successful
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ general rate limiter
exports.generalRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes ✅ matches message
  max: 9000,
  message: "Too many requests! Try again after 30 minutes",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});
