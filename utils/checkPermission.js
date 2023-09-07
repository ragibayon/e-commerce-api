const {UnauthorizedError} = require('./../errors');
const checkPermission = (requestUser, resourceUserID) => {
  console.log(requestUser === resourceUserID.toString());
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserID.toString()) return;
  throw new UnauthorizedError('You are not authorized to perform this action');
};

module.exports = checkPermission;
