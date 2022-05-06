const express = require('express');
const cors = require('cors');
const passport = require('../utils/passport');
const tokenModel = require('../model/tokenModel');

const encryptDecrypt = require('../utils/encryption-decryption');

const JWTtoken = require('../utils/JWTtoken');
const userModel = require('../model/userModel');

const app = express();

const CLIENT_URL = 'http://127.0.0.1:3000/';
//Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// GOOGLE ROUTES
app.get('/failed', (req, res) => {
  res.send('Some error occured while login to google');
});

app.get('/login/success', async (req, res) => {
  if (req.user) {
    const { email } = req.user;
    const userDetail = await userModel.findOne({ email });

    if (userDetail) {
      const obj = {
        first_name: userDetail.firstName,
        email,
      };

      const token = JWTtoken.generateToken(obj);
      await tokenModel.create({ token, userId: userDetail._id });
      res.status(200).json({
        status: 200,
        message: 'Success Login',
        token,
        user: userDetail,
      });
    } else {
      const encryptedPassword = encryptDecrypt.encryptPassword(
        'sdgrjgoefuofwgj3254357u6575'
      );
      const userDetailObj = {
        first_name: req.user.given_name,

        email: req.user.email,
        password: encryptedPassword,
        photo: req.user._json.picture,
      };
      await userModel.insertMany([userDetailObj]);
      delete userDetailObj.password;

      const token = JWTtoken.generateToken(userDetailObj);
      await tokenModel.create({ token, userId: userDetail._id });
      res.status(200).json({
        message: 'Registration Success',
        token,
      });
    }
  } else {
    res.status(400).json({ message: 'something wrong' });
  }

  // if (req.user) {
  //   const { email } = req.user;

  //   const userDetails = await userModel.findOne({ email }).select('-password');
  //   // console.log(userDetails);
  //   if (userDetails) {
  //     const token = JWTtoken.generateToken({ userDetails });
  //     await tokenModel.create({ token, userId: userDetails._id });

  //     res.status(200).json({
  //       status: 'login successfull',
  //       token,
  //       userDetails,
  //     });
  //   } else {
  //     const userDetailsObj = {
  //       first_name: req.user.given_name,
  //       last_name: req.user.family_name,
  //       email,
  //       photo: req.user.picture,
  //       password: encryptDecrypt.encryptPassword(req.user.given_name),
  //     };

  //     const data = await userModel.create(userDetailsObj);

  //     const token = JWTtoken.generateToken({ userDetails });
  //     await tokenModel.create({ token, userId: data._id });
  //     res.status(200).json({
  //       status: ' Registeration success',
  //       token,
  //       userDetails: data,
  //     });
  //   }
  // } else {
  //   res.status(400).json({
  //     status: 'login failed',
  //   });
  // }
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
    successRedirect: CLIENT_URL,
    failureRedirect: '/failed',
  })
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
});

//FACEBOOK ROUTES
app.get(
  '/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email'],
  })
);

app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/failed',
  })
);

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) return next();
//   res.redirect('/');
// }

module.exports = app;
