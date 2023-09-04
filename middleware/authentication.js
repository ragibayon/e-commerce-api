const {UnauthenticatedError, UnauthorizedError} = require('../errors');
const {isValidToken} = require('../utils/jwt');
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  try {
    const {name, userId, role} = isValidToken(token);
    req.user = {name, userId, role};
  } catch (err) {
    console.log(err);
    throw new UnauthenticatedError('Authentication invalid');
  }

  next();
};

// roles based authorization
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(
        'You do not have permission to access this route'
      );
    }
    next();
  };
};

module.exports = {authenticateUser, authorizePermissions};
