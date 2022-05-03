const passport = require('passport');
require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      // '455210522702-djfok8d0f6lc70q63l3mo3p90un2uh90.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://127.0.0.1:3030/google/callback',
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

module.exports = passport;
