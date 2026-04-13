const AppError = require("../errors/AppError");
const catchAsync = require("../utils/catchAsync");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/userModel");

const authenticate = catchAsync(async (req, res, next) => {
  // ✅ extract token from cookie
  if (!req.cookies.token) return next(new AppError("Please login first", 401));

  const token = req.cookies.token;

  // ✅ verify token
  let decode;
  try {
    decode = verifyToken(token);
  } catch (err) {
    return next(new AppError("Invalid Token! Please login again", 401)); // ✅ fixed
  }

  // ✅ check user exists
  const user = await User.findById(decode.id).select("-password");
  if (!user) return next(new AppError("User no longer exists!", 401));

  // ✅ attach user to request
  req.user = user;
  return next();
});

module.exports = authenticate;
