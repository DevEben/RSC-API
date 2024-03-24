const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    productName: {
        type: String,
    }, 
    supplierName: {
        type: String,
    },  
    supplierPhoneNumber: {
        type: String,
    },
    unitPrice: {
        type: Number,
    }, 
    quantityOrder: {
        type: Number,
    },
    totalAmount: {
        type: Number,
    }, 
    dateOrder: {
        type: String,
    },
    quantityReceived: {
        type: Number,
    },
    expectedDate: {
        type: String,
    },
    userId: {
        type: String,
    }
}, {timestamps: true})

const purchaseModel = mongoose.model('PurchaseMgt', purchaseSchema);

module.exports = purchaseModel;