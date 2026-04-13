const AppError = require('../errors/AppError');
const authorize = (...roles) => {
    return (req, res, next) => {// these is returning a middleware and authorize is a function
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(` Your role ${req.user.role} is not authorized! `, 403),
            );
            /*
      req.user set by authenticate middleware! must run AFTER authenticate!
      req.user = user; this line included the whole fields except the password so from there we can access it's role
      */
        };
       return  next();
    };
};
module.exports = authorize;