const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
    }, 
    orderDate: {
        type: String,
    },  
    productName: {
        type: String,
    },
    unitPrice: {
        type: Number,
    }, 
    quantity: {
        type: Number,
    },
    totalAmount: {
        type: Number,
    },
    paymentStatus: {
        type: String, 
    }, 
    shipmentStatus: {
        type: String, 
    }, 
    userId: {
        type: String,
    }
}, {timestamps: true})

const orderModel = mongoose.model('OrderMgt', orderSchema);

module.exports = orderModel;