const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
    }, 
    category: {
        type: String,
    }, 
    brand: {
        type: String,
    },
    productDescription: {
        type: String,
    },
    costPrice: {
        type: Number,
    }, 
    sellingPrice: {
        type: Number,
    }, 
    stockQty: {
        type: Number,
    },
    VAT: {
        type: Number,
    },
    reorderLevel: {
        type: Number,
    }, 
    lastUpdated: {
        type: String, 
    },
    userId: {
        type: String,
    }
}, {timestamps: true})

const productModel = mongoose.model('ProductMgt', productSchema);

module.exports = productModel;