const AppError = require("../errors/AppError");
const { createComment, updateComment } = require("../utils/validateComments");

exports.validateCreateComment = (req, res, next) => {
  // ✅ check if text exists first
  if (!req.body || !req.body.text)
    return next(new AppError("Comment text is required", 400));

  const result = createComment(req.body);
  if (result.isValid) return next();
  return next(
    new AppError("Some fields don't match the credentials!", 400, result.err),
  );
};

exports.validateUpdateComment = (req, res, next) => {
  // ✅ check if text exists first
  if (!req.body || !req.body.text)
    return next(new AppError("Comment text is required", 400));

  const result = updateComment(req.body);
  if (result.isValid) return next();
  return next(
    new AppError("Some fields don't match the credentials!", 400, result.err),
  );
};
