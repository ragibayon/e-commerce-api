const {StatusCodes} = require('http-status-codes');
const User = require('../models/User');
const {attachCookiesToResponse, createTokenUser} = require('../utils');
const {BadRequestError, UnauthenticatedError} = require('../errors');

const register = async (req, res, next) => {
  const {name, email, password} = req.body;
  if (!name || !email || !password) {
    throw new BadRequestError('Please provide a name, email and password');
  }

  const existingUser = await User.findOne({email});
  if (existingUser) {
    throw new BadRequestError('Email is already registered');
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  const role = isFirstUser ? 'admin' : 'user';

  const newUser = new User({
    name,
    email,
    password,
    role,
  });

  const user = await newUser.save();

  const userToken = createTokenUser(user);
  attachCookiesToResponse({res: res, user: userToken});
  res.status(StatusCodes.CREATED).json({user: userToken});
};

const login = async (req, res, next) => {
  const {email, password} = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide a email and password');
  }

  const user = await User.findOne({email});
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw new UnauthenticatedError('Invalid credentials');
  }

  const userToken = createTokenUser(user);
  attachCookiesToResponse({res: res, user: userToken});
  res.status(StatusCodes.OK).json({user: userToken});
};

const logout = async (req, res, next) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()), // as there is no delay the cookie is removed immediately
    secure: process.env.NODE_ENV === 'production',
    signed: true,
  });

  res.status(StatusCodes.OK).json({msg: 'user logged out'});
};

module.exports = {
  register,
  login,
  logout,
};
