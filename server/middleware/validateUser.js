const {
  validateRegister,
  validateUserLogin,
  validateUserUpdate,
  validateVerifyOldPassword,
  validateNewPassword,
} = require("../utils/validateUser");
const AppError = require("../errors/AppError");

exports.validateRegister = (req, res, next) => {
  // ✅ check body first
  if (!req.body || Object.keys(req.body).length === 0)
    return next(new AppError("All fields are empty", 400));

  const result = validateRegister(req.body);
  if (!result) return next(new AppError("All fields are empty", 400));
  if (result.isValid) return next();
  return next(
    new AppError("Some fields don't match the credentials!", 400, result.err),
  ); // ✅ no else
};

exports.validateLogin = (req, res, next) => {
  // ✅ check body first
  if (!req.body || Object.keys(req.body).length === 0)
    return next(new AppError("All fields are empty", 400));

  const result = validateUserLogin(req.body);
  if (result.isValid) return next();
  return next(
    new AppError("Some fields don't match the credentials!", 400, result.err),
  ); // ✅ no else
};

exports.validateUpdate = (req, res, next) => {
  // ✅ check body first
  if (!req.body || Object.keys(req.body).length === 0)
    return next(new AppError("All fields are empty", 400));

  const result = validateUserUpdate(req.body);
  if (result.isValid) return next();
  return next(
    new AppError("Some fields don't match the credentials!", 400, result.err),
  ); // ✅ no else
};

exports.checkOldPassword = (req, res, next) => {
  // ✅ no catchAsync needed
  const result = validateVerifyOldPassword(req.body);
  if (!result.isValid)
    return next(
      new AppError(
        "Password field doesn't match the credentials!",
        400,
        result.err,
      ),
    );
  return next();
};

exports.checkNewPassword = (req, res, next) => {
  const result = validateNewPassword(req.body);
  if (result.isValid) return next();
  return next(
    new AppError(
      "Password field doesn't match the credentials!",
      400,
      result.err,
    ),
  ); // ✅ no else
};
