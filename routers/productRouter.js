const express = require('express');

const router = express.Router();

const { AddProduct, viewOneProduct, viewAllProduct, updateProduct,  deleteProduct, } = require('../controllers/productController');
const { authenticate, authorizeRole } = require('../middleware/authentation');


//endpoint to Add a new stock product
router.post('/addstock/:userId', authenticate, authorizeRole('store-keeper'), AddProduct);

//endpoint to view a stock product
router.get('/viewstock/:productId', authenticate, viewOneProduct);

//endpoint to view all stock products
router.get('/viewAllstock/:userId', authenticate, viewAllProduct);

//endpoint to update a stock product
router.put('/updatestock/:productId', authenticate, authorizeRole('store-keeper'), updateProduct);

//endpoint to delete a stock product
router.delete('/deletestock/:productId/:userId', authenticate, authorizeRole('manager'), deleteProduct);


module.exports = router;