const mongoose = require("mongoose");
const AppError = require("../errors/AppError"); // ✅ imported

// ✅ reusable validator factory
const validateId = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName]))
    return next(new AppError(`Invalid ${paramName} format`, 400));
  return next();
};

exports.validatePId = validateId("pid"); // ✅ cleaner
exports.validateCID = validateId("cid"); // ✅ cleaner
exports.validateRID = validateId("rid"); // ✅ cleaner
