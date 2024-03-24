const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    itemName: {
        type: String,
    }, 
    itemDescription: {
        type: String,
    },
    brand: {
        type: String,
    },  
    unitPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
    },
    amount: {
        type: Number,
    }, 
    VAT: {
        type: Number, 
    },
    total: {
        type: Number, 
    },
    profit: {
        type: Number, 
    },
    userId: {
        type: String,
    }
}, {timestamps: true})

const salesModel = mongoose.model('SalesMgt', saleSchema);

module.exports = salesModel;