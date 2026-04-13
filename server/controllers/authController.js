const crypto = require("crypto");
const User = require("../models/userModel");
const AppError = require("../errors/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendTokenCookie, clearTokenCookie } = require("../utils/cookie");
const { createToken } = require("../utils/jwt");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/email");

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError("Invalid email or password", 401));

  const isMatch = await user.comparePasswords(password);
  if (!isMatch) return next(new AppError("Invalid email or password", 401));

  const token = createToken(user._id, user.role);
  sendTokenCookie(res, token);

  return res.status(200).json({
    status: "success",
    message: `Welcome back ${user.name}!`,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // ✅ needed for admin checks on frontend
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const existingUser = await User.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  });
  if (existingUser)
    return next(new AppError("Email or phone number already exists", 409));

  if (!req.body.dob || isNaN(new Date(req.body.dob)))
    return next(new AppError("Invalid date of birth", 400));

  const { name, email, password, phone, city } = req.body;
  const dob = new Date(req.body.dob);

  const newUser = await User.create({
    name,
    email,
    password,
    dob,
    phone,
    city,
  });

  try {
    await sendWelcomeEmail(newUser);
  } catch (err) {
    console.error("Welcome email failed:", err.message);
  }

  newUser.password = undefined;
  const token = createToken(newUser._id, newUser.role);
  sendTokenCookie(res, token);

  return res.status(201).json({
    status: "success",
    message: "Account created successfully! Check your email! 📧",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role, // ✅ needed for admin checks on frontend
    },
  });
});

exports.signOut = (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    status: "success",
    message: "Successfully signed out!",
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email)
    return next(new AppError("Please provide your email!", 400));

  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError("No account found with this email!", 404));

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateModifiedOnly: true });

  try {
    await sendPasswordResetEmail(user, resetToken);
    return res.status(200).json({
      status: "success",
      message: "Password reset link sent to your email! 📧",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateModifiedOnly: true });
    return next(
      new AppError("Error sending email! Please try again later.", 500),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token is invalid or has expired!", 400));

  if (!req.body.password || !req.body.confirmPassword)
    return next(
      new AppError("Please provide new password and confirm password!", 400),
    );

  if (req.body.password !== req.body.confirmPassword)
    return next(new AppError("Passwords do not match!", 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateModifiedOnly: true });

  const newToken = createToken(user._id, user.role);
  sendTokenCookie(res, newToken);

  return res.status(200).json({
    status: "success",
    message: "Password reset successfully! 🎉",
  });
});
