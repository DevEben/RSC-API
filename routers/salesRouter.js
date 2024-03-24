const express = require('express');

const router = express.Router();

const { recordSales, viewSale, viewAllSales, updateSales, deleteSales, salesSummary, salesBarchart, SalesPurchaseSummary, } = require('../controllers/salesController');
const { authenticate,  authorizeRole } = require('../middleware/authentation');



//endpoint to record sales of a product
router.post('/record/:userId/:productId', authenticate, authorizeRole('sales-rep'), recordSales);

//endpoint to view a sale record
router.get('/viewsale/:salesId', authenticate, authorizeRole('sales-rep'), viewSale);

//endpoint to view all sales record
router.get('/salesrecord/:userId', authenticate, authorizeRole('sales-rep'), viewAllSales);

//endpoint to update a sale record
router.put('/updatesale/:salesId/:userId', authenticate, authorizeRole('manager'), updateSales);

//endpoint to delete a sale record
router.delete('/deletesale/:salesId/:userId', authenticate, authorizeRole('manager'), deleteSales);

//endpoint to get the sales summary
router.get('/sales-summary/:userId', authenticate, salesSummary);

//endpoint to fetch data for sales by interval
router.get('/sales-by-interval/:userId', authenticate, salesBarchart);

//endpoint for sales and purchase summary
router.get('/barchart/:userId', authenticate, SalesPurchaseSummary)






module.exports = router;