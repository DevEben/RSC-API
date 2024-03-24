const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema({
    notificationType: {
        type: String, 
        trim: true,
    },
    date: {
        type: String,
    }, 
    message: {
        type: String,
        trim: true,
    },
    userId: {
        type: String,
    }

}, {timestamps: true})

const notifyModel = mongoose.model('Notification', notifySchema);

module.exports = notifyModel;