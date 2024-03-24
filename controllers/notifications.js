const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const notifyModel = require('../models/notificationModel');
const sendEmail = require('../utils/email');



// Function to handle low stock notifications
const notifyLowStock = async (userId, productId) => {
    try {
        const business = await userModel.findById(userId);
        if (!business) {
            throw new Error("Business not found");
        }
        const product = await productModel.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        // Generate notification message
        const notificationMessage = `Low stock alert!: Product ${product.productName} has only ${product.stockQty} items remaining. Please kindly restock, Thank you for choosing Rapid Stock Control!`;

        // Send notification via email
        sendEmail({
            email: business.email,
            text: notificationMessage,
            subject: `Low Stock Alert!`
        })

        // Save notification to the database
        const lowStock = await notifyModel.create({
            notificationType: "lowStockAlert",
            date: new Date().toLocaleDateString(),
            message: notificationMessage,
            userId: userId
        })
        if (!lowStock) {
            throw new Error("Error saving low stock notification");
        }
        business.notifications.push(lowStock)
        await business.save()

        // Return the notification message
        return {
            notificationType: "Low Stock Alert",
            message: notificationMessage,
            date: new Date().toLocaleDateString(),
        };

    } catch (error) {
        throw new Error("Failed to notify low stock: " + error.message);
    }
};



// Function to view a particular notification the database
const viewANotification = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const notification = await notifyModel.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                message: "No notification found",
            })
        }

        return res.status(200).json({
            message: "Notification successfully fetched",
            data: notification
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error " + error.message,
        })
    }
}




// Function to view all notifications the database
const viewAllNotification = async (req, res) => {
    try {
        const userId = req.params.userId;
        const notification = await notifyModel.find({ userId: userId }).sort({createdAt: -1});
        if (!notification) {
            return res.status(404).json({
                message: "No notification found",
            })
        }

        return res.status(200).json({
            message: "List of notifications found: ",
            totalNotifications: notification.length,
            data: notification
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error " + error.message,
        })
    }
}



//Function to delete a particular notification 
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.notificationId;
        const userId = req.params.userId;
        const notification = await notifyModel.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                message: "No notification found",
            })
        }

        const business = await userModel.findById(userId);
        if (!business) {
            return res.status(404).json({
                message: "Buiness not found"
            })
        }

        const deleteNotification = await notifyModel.findByIdAndDelete(notificationId);
        if (!deleteNotification) {
            return res.status(400).json({
                message: "Unable to delete selected notification"
            })
        };

        const notificationIndex = business.notifications.indexOf(notificationId);

        if (notificationIndex === -1) {
            return res.status(400).json({
                message: "Unable to delete selected notification from business data"
            });
        } else {
            business.notifications.splice(notificationIndex, 1);
            await business.save();
        }

        return res.status(200).json({
            message: "Notification successfully deleted"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error " + error.message,
        })
    }
}






module.exports = {
    notifyLowStock,
    viewANotification,
    viewAllNotification,
    deleteNotification,
};
