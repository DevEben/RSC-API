const express = require('express');

const router = express.Router();

const { recordOrder, viewOrder, viewAllOrders, updateOrder, deleteOrder, OrderSummary, orderBarchart, } = require('../controllers/orderController');
const { authenticate, authorizeRole } = require('../middleware/authentation');

//endpoint to record order of a product
router.post('/record-order/:userId/:productId', authenticate, authorizeRole('store-keeper'), recordOrder);

//endpoint to view a order record
router.get('/vieworder/:orderId', authenticate, viewOrder);

//endpoint to view all orders record
router.get('/ordersrecord/:userId', authenticate, viewAllOrders);

//endpoint to update a order record
router.put('/updateorder/:orderId/:productId', authenticate, authorizeRole('store-keeper'), updateOrder);

//endpoint to delete a order record
router.delete('/deleteorder/:orderId/:userId', authenticate, authorizeRole('manager'), deleteOrder);

//endpoint to get the orders summary
router.get('/orders-summary/:userId', authenticate, OrderSummary);

//endpoint to fetch data for orders by interval
router.get('/orders-by-interval/:userId', authenticate, orderBarchart);



module.exports = router;