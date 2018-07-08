const jwt = require('jwt-simple');

module.exports = user => {
  const iat = new Date().getTime();
  return jwt.encode({ sub: user.id, iat }, process.env.jwtSecret);
}
