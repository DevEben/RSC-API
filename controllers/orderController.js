const moment = require('moment');
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const { validateOrderInput, validateOrderUpdate, } = require('../middleware/validator');



// Function to record the sale of a product
const recordOrder = async (req, res) => {
    try {
        const { error } = validateOrderInput(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })
        } else {
            const userId = req.params.userId;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: 'Business not found'
                })
            }

            const order = {
                customerName: req.body.customerName,
                orderDate: req.body.orderDate,
                productName: req.body.productName,
                quantity: req.body.quantity,
                unitPrice: req.body.unitPrice,
                paymentStatus: req.body.paymentStatus,
                shipmentStatus: req.body.shipmentStatus
            }
            if (!order) {
                return res.status(404).json({
                    message: "Please input the product name, description and  quantity",
                })
            }

            // Find the product by name
            const checkProduct = await productModel.findOne({ userId: userId, productName: order.productName.toLowerCase() });
            if (!checkProduct) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            if (checkProduct.stockQty < order.quantity) {
                return res.status(400).json({
                    message: 'Insufficient stock'
                });
            }

            // Deduct sold quantity from the stock
            if(order.paymentStatus === "Paid" && order.shipmentStatus ==="Shipped"){
                checkProduct.stockQty -= order.quantity;
                await checkProduct.save();
            }


            // Create a new sale record
            const ordered = new orderModel({
                customerName: order.customerName.toLowerCase(),
                orderDate: order.orderDate,
                productName: checkProduct.productName.toLowerCase(),
                quantity: order.quantity,
                unitPrice: order.unitPrice  || checkProduct.sellingPrice,
                paymentStatus: order.paymentStatus,
                shipmentStatus: order.shipmentStatus,
                userId: userId,
            });

            let totalAmount;
            totalAmount = (order.quantity * order.unitPrice) || (order.quantity * checkProduct.sellingPrice);
            ordered.totalAmount = totalAmount;

            await ordered.save();
            user.orders.push(ordered);
            await user.save();
            return res.status(200).json({
                message: 'Sale recorded successfully',
                data: ordered
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
}



// Function to view a order record
const viewOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order record not found"
            })
        }

        return res.status(200).json({
            message: "The selected order record is: ",
            data: order
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
}



// Function to view all orders record
const viewAllOrders = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await orderModel.find({ userId: userId }).sort({createdAt: -1});
        if (!orders) {
            return res.status(404).json({
                message: "Orders record not found"
            })
        }

        const amountSold = orders.map(eachorders => eachorders.totalAmount);
        const total = eval(amountSold.join('+'));

        return res.status(200).json({
            message: "List of orders for: " + req.user.businessName,
            totalNumberOfOrdersMade: orders.length,
            totalAmountOrdered: total,
            data: orders,
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
}



//endpoint to update order record
const updateOrder = async (req, res) => {
    try {
        const { error } = validateOrderUpdate(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })
        } else {
            const productId = req.params.productId;
            const orderId = req.params.orderId;
            const order = await orderModel.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    message: "Order record not found"
                })
            }

            const checkProduct = await productModel.findById(productId);
            if (!checkProduct) {
                return res.status(404).json({
                    message: "Product not found"
                })
            };

            const orderData = {
                customerName: req.body.customerName  || order.customerName,
                orderDate: req.body.orderDate  ||  order.orderDate,
                productName: req.body.productName  || order.productName,
                quantity: req.body.quantity  || order.quantity,
                unitPrice: req.body.unitPrice  || order.unitPrice,
                paymentStatus: req.body.paymentStatus  || order.paymentStatus,
                shipmentStatus: req.body.shipmentStatus  || order.shipmentStatus
            };

            const totalAmount = (orderData.quantity * orderData.unitPrice);
            orderData.totalAmount = totalAmount || order.amount;

            // Deduct sold quantity from the stock
            if(orderData.paymentStatus === "Paid" && orderData.shipmentStatus ==="Shipped"){
                checkProduct.stockQty -= orderData.quantity;
                await checkProduct.save();
            }

            const updatedSale = await orderModel.findByIdAndUpdate(orderId, orderData, { new: true });
            if (!updatedSale) {
                return res.status(400).json({
                    message: "Updated order not found",
                })
            };
            return res.status(200).json({
                message: "Order record updated successfully",
                data: updatedSale
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
};



// Function to delete a order record
const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order record not found"
            })
        }

        const deleteOrder = await orderModel.findByIdAndDelete(orderId);
        if (!deleteOrder) {
            return res.status(400).json({
                message: "Unable to delete selected order record"
            })
        };

        const userId = req.params.userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        const orderIndex = user.orders.indexOf(orderId);

        if (orderIndex === -1) {
            return res.status(400).json({
                message: "Unable to delete selected order from user data"
            });
        } else {
            user.orders.splice(orderIndex, 1);
            await user.save();
        }

        return res.status(200).json({
            message: "Order record successfully deleted"
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
};



// Function to get Summary of weekly, monthly and Quarterly orders
const OrderSummary = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await orderModel.find({ userId: userId });

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                message: "order record not found"
            });
        }

        // Function to calculate total orders, maximum, and minimum orders for weekly, monthly, and quarterly intervals
        const calculateOrderSummary = (orders, interval) => {
            const today = moment();
            let startOfInterval, endOfInterval;

            if (interval === 'week') {
                startOfInterval = today.clone().startOf('week');
                endOfInterval = today.clone().endOf('week');
            } else if (interval === 'month') {
                startOfInterval = today.clone().startOf('month');
                endOfInterval = today.clone().endOf('month');
            } else if (interval === 'quarter') {
                startOfInterval = today.clone().startOf('quarter');
                endOfInterval = today.clone().endOf('quarter');
            }

            const OrdersInInterval = orders.filter(order => moment(order.createdAt).isBetween(startOfInterval, endOfInterval, null, '[]'));
            const amountOrderInInterval = OrdersInInterval.map(order => order.totalAmount);
            const orderByProduct = {};

            // Group orders by product
            OrdersInInterval.forEach(order => {
                if (!orderByProduct[order.productName]) {
                    orderByProduct[order.productName] = 0;
                }
                orderByProduct[order.productName] += order.totalAmount;
            });

            // Sort products by orders volume in descending order
            const sortedProducts = Object.keys(orderByProduct).sort((a, b) => orderByProduct[b] - orderByProduct[a]);


            // Calculate total orders
            const totalOrders = amountOrderInInterval.reduce((totalAmount, amount) => totalAmount + amount, 0);

            // Find maximum and minimum orders
            const maxOrder = Math.max(...amountOrderInInterval);
            const minOrder = Math.min(...amountOrderInInterval);

            // Return top selling products and their orders volume
            const topSellingProducts = sortedProducts.map(product => ({
                productName: product,
                totalOrders: orderByProduct[product]
            }));


            return {
                totalOrders,
                maxOrder,
                minOrder,
                topSellingProducts,
            };
        };

        // Calculate orders summary for weekly, monthly, and quarterly intervals
        const ordersSummaryWeekly = calculateOrderSummary(orders, 'week');
        const ordersSummaryMonthly = calculateOrderSummary(orders, 'month');
        const ordersSummaryQuarterly = calculateOrderSummary(orders, 'quarter');

        // Calculate total amount ordered
        const totalAmountOrdered = orders.reduce((total, order) => total + order.totalAmount, 0);

        return res.status(200).json({
            totalNumberOfOrderMade: orders.length,
            totalAmountOrdered: totalAmountOrdered,
            ordersSummaryWeekly: ordersSummaryWeekly,
            ordersSummaryMonthly: ordersSummaryMonthly,
            ordersSummaryQuarterly: ordersSummaryQuarterly
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        });
    }
}



// Function to fetch orders data for the specified interval
const orderBarchart = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required'
            });
        }

        const today = moment();
        const intervals = ['weekly', 'monthly', 'quarterly'];
        const responseData = {};

        for (const interval of intervals) {
            let startDate, endDate;

            if (interval === 'weekly') {
                startDate = today.clone().startOf('week');
                endDate = today.clone().endOf('week');
            } else if (interval === 'monthly') {
                startDate = today.clone().startOf('month');
                endDate = today.clone().endOf('month');
            } else if (interval === 'quarterly') {
                startDate = today.clone().startOf('quarter');
                endDate = today.clone().endOf('quarter');
            }

            // Fetch orders data from the database for the specified interval and business
            const orders = await orderModel.find({
                userId: userId,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Initialize ordersData object with all required keys set to zero
            const initializeOrdersData = (interval) => {
                const ordersData = {};

                if (interval === 'weekly') {
                    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    daysOfWeek.forEach(day => {
                        ordersData[day] = 0;
                    });
                } else if (interval === 'monthly') {
                    const months = moment.monthsShort();
                    months.forEach(month => {
                        ordersData[month] = 0;
                    });
                } else if (interval === 'quarterly') {
                    for (let i = 1; i <= 4; i++) {
                        ordersData[`Q${i}`] = 0;
                    }
                }

                return ordersData;
            }

            // Group orders data based on the interval
            const groupOrderData = (orders, ordersData, interval) => {
                orders.forEach(order => {
                    let key;
                    if (interval === 'weekly') {
                        key = moment(order.createdAt).format('ddd');
                    } else if (interval === 'monthly') {
                        key = moment(order.createdAt).format('MMM');
                    } else if (interval === 'quarterly') {
                        key = `Q${moment(order.createdAt).quarter()}`;
                    }
                    ordersData[key] += order.totalAmount;
                });
            }

            // Process the data and calculate total orders
            const ordersData = initializeOrdersData(interval);

            // Group orders data based on the interval
            groupOrderData(orders, ordersData, interval);

            // Add orders data to the response object
            responseData[interval] = ordersData;
        }


        return res.status(200).json({
            message: "Orders data for weekky, monthly and quarterly",
            data: responseData
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error' + error.message
        });
    }
};




module.exports = {
    recordOrder, 
    viewOrder,
    viewAllOrders,
    updateOrder,
    deleteOrder,
    OrderSummary,
    orderBarchart,

}