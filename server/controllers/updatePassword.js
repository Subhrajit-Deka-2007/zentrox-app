const AppError = require("../errors/AppError");
const User = require("../models/userModel");
const catchAsync = require('../utils/catchAsync');



exports.verifyOldPassword = catchAsync(async (req, res, next) => {
  const { oldPassword } = req.body;
  const { _id } = req.user;

  //  fetch user with password included
  const user = await User.findById(_id).select("+password");
  if (!user) return next(new AppError("User doesn't exist", 404));

  //  compare passwords
  const isMatch = await user.comparePasswords(oldPassword);
  if (!isMatch)
    return next(new AppError("Passwords don't match! Please try again", 401));

  //  call next() to proceed to updatePassword middleware
  return res.status(200).json({
    status: 'success',
    message: 'Verified'
  });

});




exports.updatePassword = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body; // correct field name
  const { _id } = req.user;

  //  fetch user with password included for save hook
  const user = await User.findById(_id).select("+password");
  if (!user) return next(new AppError("User doesn't exist", 404));

  //  NEW CHECK: Is the new password the same as the current one?
  const isSamePassword = await user.comparePasswords(newPassword);
  if (isSamePassword) {
    return next(
      new AppError("New password cannot be the same as your old password", 400),
    );
  }

  //  set new password — pre save hook will hash it
  user.password = newPassword;
  await user.save({ validateModifiedOnly: true });

  return res.status(200).json({
    status: "success",
    message: "Password updated successfully", //  no password in response
  });
});
/*
1. Should you focus on this?
Yes, for two main reasons:

Security Best Practices: If a user’s account was potentially compromised, "updating" to the same password provides zero extra protection. Many systems force a change to ensure a fresh, new secret is created.

System Integrity: Your pre-save hook in the User model will run again. It will re-hash the password and update the passwordChangedAt timestamp (if you have one). Updating the "last changed" date when the password didn't actually change is misleading data.
*/