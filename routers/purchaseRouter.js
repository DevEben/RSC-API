const express = require('express');

const router = express.Router();

const { AddPurchase, viewPurchaseRecord, viewAllPurchases, updatePurchaseRecord, deletePurchaseRecord, purchasesSummary, purchaseBarchart, } = require('../controllers/purchaseController');
const { authenticate, authorizeRole } = require('../middleware/authentation');

//endpoint to Add a new purchase record
router.post('/addpurchase/:userId', authenticate, authorizeRole('manager'), AddPurchase);

//endpoint to view a purchase record
router.get('/viewpurchase/:purchaseId', authenticate, authorizeRole('manager'), viewPurchaseRecord);

//endpoint to view all purchase records
router.get('/viewAllpurchase/:userId', authenticate, authorizeRole('manager'), viewAllPurchases);

//endpoint to update a purchase record
router.put('/updatepurchase/:purchaseId', authenticate, authorizeRole('manager'), updatePurchaseRecord);

//endpoint to delete a purchase record
router.delete('/deletepurchase/:purchaseId/:userId', authenticate, authorizeRole('manager'), deletePurchaseRecord);

//endpoint to get the purchases summary
router.get('/purchase-summary/:userId', authenticate, purchasesSummary);

//endpoint to fetch data for purchases by interval
router.get('/purchase-by-interval/:userId', authenticate, purchaseBarchart);



module.exports = router;