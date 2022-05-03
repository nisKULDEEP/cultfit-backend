const express = require('express');
const passport = require('../utils/passport');
const userModel = require('../model/userModel');
const JWTtoken = require('../utils/JWTtoken');
const encryptDecrypt = require('../utils/encryption-decryption');
const tokenModel = require('../model/tokenModel');

const app = express();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/failed', (req, res) => {
  res.status(401).json({
    status: 'failed',
    message: 'google login failed',
  });
});

app.get('/success', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Welcome `,
    user: req.user,
  });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('http://127.0.0.1:3000/');
});

app.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

app.get(
  '/google/callback',
  passport.authenticate('google', {
    // successRedirect: '/google/success',
    failureRedirect: '/failed',
  }),
  async (req, res) => {
    const { email } = req.user;

    const userDetails = await userModel.findOne({ email }).select('-password');

    if (userDetails) {
      const token = JWTtoken.generateToken({ userDetails });
      await tokenModel.create({ token, userId: userDetails._id });

      res.status(200).json({
        status: 'login successfull',
        token,
        userDetails,
      });
    } else {
      const userDetailsObj = {
        first_name: req.user.given_name,
        last_name: req.user.family_name,
        email,
        photo: req.user.picture,
        password: encryptDecrypt.encryptPassword(req.user.given_name),
      };

      const data = await userModel.create(userDetailsObj);

      const token = JWTtoken.generateToken({ userDetails });
      await tokenModel.create({ token, userId: data._id });
      res.status(200).json({
        status: ' Registeration success',
        token,
        userDetails: data,
      });
    }
  }
);

module.exports = app;
