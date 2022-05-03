const express = require('express');

const app = express();

const middleware = require('../Middleware/middleware');
const {
  allProducts,
  uploadProducts,
  updateProducts,
  deleteProduct,
} = require('../controllers/product.controller');

app.get('/', allProducts);
app.post('/upload', middleware.isAdmin, uploadProducts);
app.patch('/:id', updateProducts);
app.delete('/:id', deleteProduct);

module.exports = app;
