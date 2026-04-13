const AppError = require("../errors/AppError"); // ✅ imported

exports.validRating = (req, res, next) => {
  const { rate } = req.body; // ✅ consistent field name

  // ✅ check if rating exists
  if (!rate) return next(new AppError("Rating is required", 400));

  const stars = Number(rate);

  // ✅ check for NaN
  if (isNaN(stars))
    return next(new AppError("Rating must be a valid number", 400));

  // ✅ correct range 1-5
  if (stars < 1 || stars > 5)
    return next(new AppError("Rating should be between 1 and 5", 400));

  req.body.rate = stars; // ✅ attach converted number to body
  return next();
};
