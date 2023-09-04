const createTokenUser = user => {
  const userToken = {
    name: user.name,
    userId: user._id,
    role: user.role,
  };

  return userToken;
};

module.exports = createTokenUser;
