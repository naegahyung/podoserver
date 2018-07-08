const passport = require('passport');
const requireSignin = passport.authenticate('local', { session: false });
const requireToken = passport.authenticate('jwt', { session: false });
const tokenForUser = require('../services/token');

module.exports = app => {
  app.post('/api/signin', requireSignin, (req, res) => {
    res.cookie('access_podo', tokenForUser(req.user), { maxAge: 2592000000, httpOnly: true } ); 
    res.send("Success");
  });

  app.get('/api/currentuser', requireToken, (req, res) => {
    res.send({ id: req.user._id, username: req.user.username, status: req.user.status });
  });

  app.get('/api/signout', requireToken, (req, res) => {
    res.clearCookie('access_podo');
    res.send("Success");
  });
}
