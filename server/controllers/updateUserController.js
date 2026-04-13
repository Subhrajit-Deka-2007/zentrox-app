const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../errors/AppError"); // Make sure this is imported!

exports.updateUser = catchAsync(async (req, res, next) => {
  const { _id } = req.user;

  // 1. Filter req.body to ONLY allow specific fields
  // This prevents a user from sending { "role": "admin" } in Postman
  const filteredBody = {};
  const allowedFields = ["name", "city", "phone", "dob"];

  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
  });

  // 2. Check if the user is sending an empty update
  if (Object.keys(filteredBody).length === 0) {
    return next(
      new AppError(
        "Please provide fields to update (name, city, phone, or dob)",
        400,
      ),
    );
  }

  // 3. Update the user
  // We use filteredBody instead of req.body for security
    const updatedUser = await User.findByIdAndUpdate(_id, filteredBody, {
        new: true, // Return the updated document
        runValidators: true, // VERY IMPORTANT: Ensures phone/email validation still runs
    }).select('-password -role -_id -phone -createdAt -updatedAt -__v');

  if (!updatedUser) {
    return next(new AppError("User not found!", 404));
  }

  return res.status(200).json({
    status: "success",
    message: "User data updated successfully",
    data: {
      user: updatedUser,
    },
  });
});
