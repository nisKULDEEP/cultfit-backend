const jwt = require('jsonwebtoken');
const tokenModel = require('../model/tokenModel');

// const SECRET_KEY = 'MY_secret_key';
const { SECRET_KEY } = process.env;

function generateToken(payload) {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '604800s' });
  return token;
}

async function verifyToken(token) {
  const data = jwt.verify(token, SECRET_KEY);
  if (!data) {
    await tokenModel.findOneAndDelete({ token });
  }
  return data;
}

module.exports = {
  generateToken,
  verifyToken,
};
