const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
    }, 
    lastName: {
        type: String,
        trim: true,
    }, 
    businessName: {
        type: String,
        trim: true,
    }, 
    email: {
        type: String,
        trim: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    confirmPassword: {
        type: String,
    },
    role: {
        type: String,
        enum: ["owner", "manager", "sales-rep", "store-keeper"],
        default: "owner",
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    logoImg: {
        url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    token: {
        type: String,
    },
    plan: {
        type: String,
        enum: ["free", "premium"],
        default: "free",
    },
    subscriptionDate: {
        type: Date,
    },
    otpCode: {
        type: String,
        trim: true,
    },
    userInput: {
        type: String,
        trim: true,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductMgt',
    }],
    sales: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesMgt',
    }],
    purchases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseMgt'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderMgt"
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification"
    }],
}, {timestamps: true})

const userModel = mongoose.model('Business', userSchema);

module.exports = userModel;