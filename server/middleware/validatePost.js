const AppError = require("../errors/AppError");
const {
  validateCreatePost,
  validateUpdatePost,
} = require("../utils/validatePost");

exports.validateCreatePost = (req, res, next) => {
  console.log("validateCreatePost body:", req.body);
  console.log("validateCreatePost file:", req.file);
  // ✅ for create — title and description are required in body
  if (!req.body || !req.body.title || !req.body.description)
    return next(new AppError("Title and description are required", 400));

  const result = validateCreatePost(req.body);
  if (result.isValid) return next();
  return next(
    new AppError("Some fields don't match the credentials!", 400, result.err),
  );
};

exports.validateUpdatePost = (req, res, next) => {
  // ✅ for update — body can be empty if only image is being updated
  // so only validate if body fields are present
  if (!req.body && !req.file)
    return next(new AppError("Please provide something to update", 400));

  // ✅ if body exists and has fields then validate them
  if (req.body && Object.keys(req.body).length > 0) {
    const result = validateUpdatePost(req.body);
    if (!result.isValid)
      return next(
        new AppError(
          "Some fields don't match the credentials!",
          400,
          result.err,
        ),
      );
  }

  return next();
};
