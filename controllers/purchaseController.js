const moment = require('moment');
const purchaseModel = require('../models/purchaseModel');
const userModel = require('../models/userModel');
const {  validatePurchaseInput, validatePurchaseUpdate, } = require('../middleware/validator');



// Function to add a purchase 
const AddPurchase = async (req, res) => {
    try {
        const { error } = validatePurchaseInput(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })
        } else {
        const userId = req.params.userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        const purchaseData = {
            productName: req.body.productName.trim(),
            supplierName: req.body.supplierName.trim(),
            supplierPhoneNumber: req.body.supplierPhoneNumber.trim(),
            unitPrice: req.body.unitPrice,
            quantityOrder: req.body.quantityOrder,
            dateOrder: req.body.dateOrder,
            quantityReceived: req.body.quantityReceived,
            expectedDate: req.body.expectedDate
        }

        if (purchaseData.quantityReceived > purchaseData.quantityOrder) {
            return res.status(400).json({
                message: "Quantity received is more than the requested ordered quantity"
            })
        }

        if (!purchaseData) {
            return res.status(400).json({
                message: "Please enter the product name, supplier name, supplier phone number, unit price, quantity Order, total amount, date ordered, quantity ordered and expected date"
            })
        }

        const amount = (purchaseData.unitPrice * purchaseData.quantityOrder)

        const purchase = new purchaseModel({
            productName: purchaseData.productName.toLowerCase(),
            supplierName: purchaseData.supplierName.toLowerCase(),
            supplierPhoneNumber: purchaseData.supplierPhoneNumber,
            unitPrice: purchaseData.unitPrice,
            quantityOrder: purchaseData.quantityOrder,
            totalAmount: amount,
            dateOrder: purchaseData.dateOrder,
            quantityReceived: purchaseData.quantityReceived,
            expectedDate: purchaseData.expectedDate,
            userId: userId
        })

        if (!purchase) {
            return res.status(404).json({
                message: 'Purchase record not found',
            })
        }
        await purchase.save();
        user.purchases.push(purchase);
        await user.save();
        return res.status(200).json({
            message: 'Purchase record added successfully',
            data: purchase
        });
    }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error " + error.message,
        })
    }
}



// Function to view a purchase record
const viewPurchaseRecord = async (req, res) => {
    try {
        const purchaseId = req.params.purchaseId;
        const purchaseRecord = await purchaseModel.findById(purchaseId);
        if (!purchaseRecord) {
            return res.status(404).json({
                message: "Purchase record not found",
            })
        }

        return res.status(200).json({
            message: "The selected purchase record is: ",
            data: purchaseRecord
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error " + error.message,
        })
    }
}


// Function to view all purchase records
const viewAllPurchases = async (req, res) => {
    try {
        const userId = req.params.userId;
        const purchases = await purchaseModel.find({ userId: userId }).sort({createdAt: -1});
        if (!purchases) {
            return res.status(404).json({
                message: "Purchase records not found"
            });
        }

        const amountPurchased = purchases.map(eachpurchase => eachpurchase.totalAmount);
        const total = eval(amountPurchased.join('+'));

        return res.status(200).json({
            message: "List of purchase records for " + req.user.businessName,
            totalNumberPurchases: purchases.length,
            totalPurchasesMade: total,
            data: purchases,
        });


    } catch (error) {
        return res.status(500).json({
            message: "Internal server error " + error.message,
        })
    }
};




// Function to update a purchase record 
const updatePurchaseRecord = async (req, res) => {
    try {
        // const { error } = validatePurchaseUpdate(req.body);
        // if (error) {
        //     return res.status(500).json({
        //         message: error.details[0].message
        //     })
        // } else {
        const purchaseId = req.params.purchaseId
        const purchase = await purchaseModel.findById(purchaseId)
        if (!purchase) {
            return res.status(404).json({
                message: "Purchase record not found"
            });
        }

        const purchaseData = {
            productName: req.body.productName || purchase.productName,
            supplierName: req.body.supplierName || purchase.supplierName,
            supplierPhoneNumber: req.body.supplierPhoneNumber || purchase.supplierPhoneNumber,
            unitPrice: req.body.unitPrice || purchase.unitPrice,
            quantityOrder: req.body.quantityOrder || purchase.quantityOrder,
            dateOrder: req.body.dateOrder || purchase.dateOrder,
            quantityReceived: req.body.quantityReceived || purchase.quantityReceived,
            expectedDate: req.body.expectedDate || purchase.expectedDate,
        }

        if (purchaseData.quantityReceived > purchaseData.quantityOrder) {
            return res.status(400).json({
                message: "Quantity received is more than the requested ordered quantity"
            })
        }

        const amount = (purchaseData.unitPrice * purchaseData.quantityOrder);
        purchaseData.totalAmount = amount || purchase.totalAmount;


        const updatedPurchase = await purchaseModel.findByIdAndUpdate(purchaseId, purchaseData, { new: true });
        if (!updatedPurchase) {
            return res.status(404).json({
                message: "Purchase record not found"
            });
        }

        return res.status(200).json({
            message: "Purchase record updated successfully",
            data: updatedPurchase
        })
    //}
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
}



//  Function to delete a product
const deletePurchaseRecord = async (req, res) => {
    try {
        const purchaseId = req.params.purchaseId
        const purchase = await purchaseModel.findById(purchaseId)
        if (!purchase) {
            return res.status(404).json({
                message: "Purchase record not found"
            });
        }

        const deleteAPurchase = await purchaseModel.findByIdAndDelete(purchaseId);
        if (!deleteAPurchase) {
            return res.status(400).json({
                message: "Unable to delete Purchase record"
            });
        }

        const userId = req.params.userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        const purchaseIndex = user.purchases.indexOf(purchaseId);

        if (purchaseIndex === -1) {
            return res.status(400).json({
                message: "Unable to delete purchase record from user data"
            });
        } else {
            user.purchases.splice(purchaseIndex, 1);
            await user.save();
        }

        return res.status(200).json({
            message: "Purchase record successfully deleted"
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
};



// Function to get Summary of weekly, monthly and Quarterly purchases
const purchasesSummary = async (req, res) => {
    try {
        const userId = req.params.userId;
        const purchase = await purchaseModel.find({ userId: userId });

        if (!purchase || purchase.length === 0) {
            return res.status(404).json({
                message: "Purchase record not found"
            });
        }

        // Function to calculate total purchase, maximum, and minimum purchase for weekly, monthly, and quarterly intervals
        const calculatePurchaseSummary = (purchase, interval) => {
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

            const purchaseInInterval = purchase.filter(eachpurchase => moment(eachpurchase.createdAt).isBetween(startOfInterval, endOfInterval, null, '[]'));
            const amountPurchasedInInterval = purchaseInInterval.map(eachpurchase => eachpurchase.totalAmount);

            // Calculate total Purchases
            const totalPurchase = amountPurchasedInInterval.reduce((total, amount) => total + amount, 0);

            // Find maximum and minimum purchases
            const maxPurchase = Math.max(...amountPurchasedInInterval);
            const minPurchase = Math.min(...amountPurchasedInInterval);

            // Find top purchased product
            const topPurchasedProduct = purchaseInInterval.reduce((topProduct, currentPurchase) => {
                return currentPurchase.total > topProduct.total ? currentPurchase : topProduct;
            }, { total: 0 });

            return {
                totalPurchase,
                maxPurchase,
                minPurchase,
                topPurchasedProduct: topPurchasedProduct.itemName
            };
        };

        // Calculate purchases summary for weekly, monthly, and quarterly intervals
        const purchasesSummaryWeekly = calculatePurchaseSummary(purchase, 'week');
        const purchasesSummaryMonthly = calculatePurchaseSummary(purchase, 'month');
        const purchasesSummaryQuarterly = calculatePurchaseSummary(purchase, 'quarter');

        // Calculate total amount purchased
        const totalAmountPurchased = purchase.reduce((total, eachpurchase) => total + eachpurchase.totalAmount, 0);

        return res.status(200).json({
            totalNumberOfPurchasesMade: purchase.length,
            totalAmountPurchased: totalAmountPurchased,
            purchasesSummaryWeekly: purchasesSummaryWeekly,
            purchasesSummaryMonthly: purchasesSummaryMonthly,
            purchasesSummaryQuarterly: purchasesSummaryQuarterly
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        });
    }
}




// Function to fetch purchase data for the specified interval
const purchaseBarchart = async (req, res) => {
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

            // Fetch purchase data from the database for the specified interval and business
            const purchases = await purchaseModel.find({
                userId: userId,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Initialize purchaseData object with all required keys set to zero
            const initializePurchaseData = (interval) => {
                const purchaseData = {};

                if (interval === 'weekly') {
                    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    daysOfWeek.forEach(day => {
                        purchaseData[day] = 0;
                    });
                } else if (interval === 'monthly') {
                    const months = moment.monthsShort();
                    months.forEach(month => {
                        purchaseData[month] = 0;
                    });
                } else if (interval === 'quarterly') {
                    for (let i = 1; i <= 4; i++) {
                        purchaseData[`Q${i}`] = 0;
                    }
                }

                return purchaseData;
            }

            // Group purchase data based on the interval
            const groupPurchaseData = (purchases, purchaseData, interval) => {
                purchases.forEach(purchase => {
                    let key;
                    if (interval === 'weekly') {
                        key = moment(purchase.createdAt).format('ddd');
                    } else if (interval === 'monthly') {
                        key = moment(purchase.createdAt).format('MMM');
                    } else if (interval === 'quarterly') {
                        key = `Q${moment(purchase.createdAt).quarter()}`;
                    }
                    purchaseData[key] += purchase.totalAmount;
                });
            }

            // Process the data and calculate total purchase
            const purchaseData = initializePurchaseData(interval);

            // Group purchase data based on the interval
            groupPurchaseData(purchases, purchaseData, interval);

            // Add purchase data to the response object
            responseData[interval] = purchaseData;
        }

        return res.status(200).json({
            message: "Purchase data for weekky, monthly and quarterly",
            data: responseData
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error' + error.message
        });
    }
};






module.exports = {
    AddPurchase,
    viewPurchaseRecord,
    viewAllPurchases,
    updatePurchaseRecord,
    deletePurchaseRecord,
    purchasesSummary,
    purchaseBarchart,

}