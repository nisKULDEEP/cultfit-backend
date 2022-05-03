const JWTService = require('../utils/JWTtoken');
const tokenModel = require('../model/tokenModel');

async function isValidToken(req, res, next) {
  try {
    let { token } = req.headers;
    token = token.split(' ')[1];
    if (token) {
      JWTService.verifyToken(token);
      //verification token in db
      const result = await tokenModel.findOne({ token });
      if (result) {
        next();
      } else {
        res
          .status(400)
          .json({ status: 'failed', message: 'Token is not present in DB' });
      }
    } else {
      res
        .status(400)
        .json({ status: 'failed', message: 'Token is not present in header' });
    }
  } catch (error) {
    res.json({
      status: 'token error',
      error,
    });
  }
}

function isAdmin(req, res, next) {
  try {
    let { token } = req.headers;
    token = token.split(' ')[1];
    const response = JWTService.verifyToken(token);

    if (response.role !== 'ADMIN') {
      res.json({
        message: 'User is not Admin.Only Admin can access this route',
      });
    }

    next();
  } catch (error) {
    res.json(error);
  }
}

module.exports = {
  isValidToken,
  isAdmin,
};
