const {createJWT, isValidToken, attachCookiesToResponse} = require('./jwt');
const createTokenUser = require('./createTokenUser');
const checkPermission = require('./checkPermission');

module.exports = {
  createJWT,
  isValidToken,
  attachCookiesToResponse,
  createTokenUser,
  checkPermission,
};
