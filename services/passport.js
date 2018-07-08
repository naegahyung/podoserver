const passport = require('passport');
const mongoose = require('mongoose');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

const User = mongoose.model('user');

const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_podo'];
  }
  return token;
};

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.jwtSecret
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  const user = await User.findById(payload.sub).exec();

  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

const localOptions = { usernameField: 'email' };

const localLogin = new LocalStrategy(localOptions, async (username, password, done) => {
  try {
    const user = await User.findOne({ email: username.toLowerCase() }).exec();
    if (!user) { done(null, false) }

    user.comparePassword(password, (result) => {
      if (!result) { return done(null, false); }

      return done(null, user);
    });

  } catch (err) {
    done(err);
  }
});

passport.use(jwtLogin);
passport.use(localLogin);
