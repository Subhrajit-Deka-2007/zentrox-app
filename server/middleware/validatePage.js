const AppError = require("../errors/AppError"); // ✅ imported

exports.validatePagination = (req, res, next) => {
  // ✅ no catchAsync needed
  let { page, limit } = req.query;

  // ✅ default to page 1
  page = page ? parseInt(page) : 1;
  if (isNaN(page) || page < 1)
    return next(
      new AppError("Page must be a valid number greater than 0", 400),
    );

  // ✅ validate limit
  limit = limit ? parseInt(limit) : 10;
  if (isNaN(limit) || limit < 1)
    return next(
      new AppError("Limit must be a valid number greater than 0", 400),
    );
  if (limit > 100) return next(new AppError("Limit cannot exceed 100", 400));

  req.query.page = page;
  req.query.limit = limit; // ✅ attach limit to query
  return next();
};
