const AppError = require('../utils/AppError');

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    return next();
  };
}

module.exports = { requireRoles };
