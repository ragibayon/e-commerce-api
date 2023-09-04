const {StatusCodes} = require('http-status-codes');
const {
  NotFoundError,
  UnauthenticatedError,
  BadRequestError,
} = require('./../errors');
const User = require('./../models/User');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermission,
} = require('../utils');

const getAllUsers = async (req, res, next) => {
  const users = await User.find({
    role: 'user',
  }).select('-password');
  res.status(StatusCodes.OK).json({
    users,
    count: users.length,
  });
};

const getSingleUser = async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new NotFoundError(`No user with id: ${userId}`);
  }

  checkPermission(req.user, user._id);
  res.status(StatusCodes.OK).json({user});
};

const showCurrentUser = async (req, res, next) => {
  res.status(StatusCodes.OK).json({
    user: req.user,
  });
};

const updateUser = async (req, res, next) => {
  const {name, email} = req.body;
  if (!name || !email) {
    throw new BadRequestError('Please provide a name and email');
  }

  const user = await User.findById(req.user.userId);
  user.name = name;
  user.email = email;

  await user.save();
  const tokenUser = createTokenUser(user);
  // so that change in user is reflected in the fe via cookie
  attachCookiesToResponse({res: res, user: tokenUser});
  res.status(StatusCodes.OK).json({user: tokenUser});
};

const updateUserPassword = async (req, res, next) => {
  const {oldPassword, newPassword} = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide a valid password');
  }

  const user = await User.findById(req.user.userId);

  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched) {
    throw new UnauthenticatedError('Invalid credentials');
  }
  user.password = newPassword;
  await user.save();

  res.status(StatusCodes.OK).json({msg: 'password updated'});
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
