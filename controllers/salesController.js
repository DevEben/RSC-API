const moment = require('moment');
const productModel = require('../models/productModel');
const purchaseModel = require('../models/purchaseModel');
const userModel = require('../models/userModel');
const salesModel = require('../models/salesModel');
const orderModel = require('../models/orderModel');
const { validateSalesInput, validateSalesUpdate, } = require('../middleware/validator');




// Function to record the sale of a product
const recordSales = async (req, res) => {
    try {
        const { error } = validateSalesInput(req.body);
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            })
        } else {
            const userId = req.params.userId;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                })
            }
            const product = {
                itemName: req.body.itemName,
                itemDescription: req.body.itemDescription,
                quantity: req.body.quantity,
            }
            if (!product) {
                return res.status(404).json({
                    message: "Please input the product name, description and  quantity",
                })
            }

            // Find the product by name
            const checkProduct = await productModel.findOne({ userId: userId, productName: product.itemName.toLowerCase() });
            if (!checkProduct) {
                return res.status(404).json({
                    message: 'Product not found in product list',
                });
            }

            if (checkProduct.stockQty < product.quantity) {
                return res.status(400).json({
                    message: 'Insufficient stock'
                });
            }

            // Deduct sold quantity from the stock
            checkProduct.stockQty -= product.quantity;
            await checkProduct.save();

            // Create a new sale record
            const sale = new salesModel({
                itemName: checkProduct.productName,
                itemDescription: product.itemDescription,
                brand: checkProduct.brand,
                quantity: product.quantity,
                unitPrice: checkProduct.sellingPrice,
                amount: (product.quantity * checkProduct.sellingPrice),
                VAT: checkProduct.VAT || 0,
                total: (product.quantity * checkProduct.sellingPrice) + (checkProduct.VAT * product.quantity),
                profit: (checkProduct.sellingPrice - checkProduct.costPrice) * product.quantity,
                userId: userId,
            });

            await sale.save();
            user.sales.push(sale);
            await user.save();

            return res.status(200).json({
                message: 'Sale recorded successfully',
                data: sale
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
}



// Function to view a sales record
const viewSale = async (req, res) => {
    try {
        const salesId = req.params.salesId;
        const sale = await salesModel.findById(salesId);
        if (!sale) {
            return res.status(404).json({
                message: "Sale record not found"
            })
        }

        return res.status(200).json({
            message: "The selected sale record is: ",
            data: sale
        })

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
}


// Function to view a sales record
const viewAllSales = async (req, res) => {
    try {
        const userId = req.params.userId;
        const sales = await salesModel.find({ userId: userId }).sort({createdAt: -1});

        if (sales.length === 0) {
            return res.status(404).json({
                message: "No sales record found"
            });
        }

        const totalAmountSold = sales.reduce((total, sale) => total + sale.total, 0);

        return res.status(200).json({
            message: `List of sales for: ${req.user.businessName}`,
            totalNumberOfSalesMade: sales.length,
            totalAmountSold: totalAmountSold,
            data: sales
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        });
    }
}




//endpoint to update sales record
const updateSales = async (req, res) => {
    try {
        const userId = req.params.userId;
        const salesId = req.params.salesId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const sale = await salesModel.findById(salesId);
        if (!sale) {
            return res.status(404).json({
                message: `Sale record with ID ${salesId} not found`
            });
        }

        const salesUpdateData = {
            itemName: req.body.itemName || sale.itemName,
            itemDescription: req.body.itemDescription || sale.itemDescription,
            quantity: req.body.quantity || sale.quantity,
        };

        const checkProduct = await productModel.findOne({ userId: userId, productName: sale.itemName });
        if (!checkProduct) {
            return res.status(404).json({
                message: `Product ${salesUpdateData.itemName} was not found`
            });
        }

        const quantityDifference = salesUpdateData.quantity - sale.quantity;

        const amount = (salesUpdateData.quantity * checkProduct.sellingPrice);
        const total = amount + (sale.VAT * salesUpdateData.quantity);
        const profit = (checkProduct.sellingPrice - checkProduct.costPrice) * salesUpdateData.quantity;

        salesUpdateData.amount = amount;
        salesUpdateData.total = total;
        salesUpdateData.profit = profit;

        checkProduct.stockQty -= quantityDifference;
        await checkProduct.save();

        const updatedSale = await salesModel.findByIdAndUpdate(salesId, salesUpdateData, { new: true });
        if (!updatedSale) {
            return res.status(400).json({
                message: `Updated sale with ID ${salesId} not found`,
            });
        }

        return res.status(200).json({
            message: "Sales records updated successfully",
            data: updatedSale
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        });
    }
};




// Function to delete a sale record
const deleteSales = async (req, res) => {
    try {
        const salesId = req.params.salesId;
        const sale = await salesModel.findById(salesId);
        if (!sale) {
            return res.status(404).json({
                message: "Sale record not found"
            })
        }

        const deletesale = await salesModel.findByIdAndDelete(salesId);
        if (!deletesale) {
            return res.status(400).json({
                message: "Unable to delete selected sale record"
            })
        };

        const userId = req.params.userId
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        const salesIndex = user.sales.indexOf(salesId);

        if (salesIndex === -1) {
            return res.status(400).json({
                message: "Unable to delete selected sale from user data"
            });
        } else {
            user.sales.splice(salesIndex, 1);
            await user.save();
        }

        return res.status(200).json({
            message: "Sale record successfully deleted"
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        })
    }
};




// Function to get Summary of weekly, monthly and Quarterly sales
const salesSummary = async (req, res) => {
    try {
        const userId = req.params.userId;
        const sales = await salesModel.find({ userId: userId });

        if (!sales || sales.length === 0) {
            return res.status(404).json({
                message: "Sales record not found"
            });
        }

        // Function to calculate total sales, maximum, and minimum sales for weekly, monthly, and quarterly intervals and profits
        const calculateSalesSummary = (sales, interval) => {
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

            const salesInInterval = sales.filter(sale => moment(sale.createdAt).isBetween(startOfInterval, endOfInterval, null, '[]'));
            const amountSoldInInterval = salesInInterval.map(sale => sale.total);
            const amountProfitsInInterval = salesInInterval.map(sale => sale.profit);
            const salesByProduct = {};

            // Group sales by product
            salesInInterval.forEach(sale => {
                if (!salesByProduct[sale.itemName]) {
                    salesByProduct[sale.itemName] = 0;
                }
                salesByProduct[sale.itemName] += sale.total;
            });

            // Sort products by sales volume in descending order
            const sortedProducts = Object.keys(salesByProduct).sort((a, b) => salesByProduct[b] - salesByProduct[a]);


            // Calculate total sales
            const totalSales = amountSoldInInterval.reduce((total, amount) => total + amount, 0);

            // Calculate total profits
            const totalProfit = amountProfitsInInterval.reduce((profit, amount) => profit + amount, 0);

            // Find maximum and minimum sales
            const maxSale = Math.max(...amountSoldInInterval);
            const minSale = Math.min(...amountSoldInInterval);


            const topSellingProducts = sortedProducts.slice(0, 15).map(product => ({
                productName: product,
                totalSales: salesByProduct[product]
            }));


            return {
                totalSales,
                totalProfit,
                maxSale,
                minSale,
                topSellingProducts,
            };
        };

        // Calculate sales summary for weekly, monthly, and quarterly intervals
        const salesSummaryWeekly = calculateSalesSummary(sales, 'week');
        const salesSummaryMonthly = calculateSalesSummary(sales, 'month');
        const salesSummaryQuarterly = calculateSalesSummary(sales, 'quarter');

        // Calculate total amount sold
        const totalAmountSold = sales.reduce((total, sale) => total + sale.total, 0);

        return res.status(200).json({
            totalNumberOfSalesMade: sales.length,
            totalAmountSold: totalAmountSold,
            salesSummaryWeekly: salesSummaryWeekly,
            salesSummaryMonthly: salesSummaryMonthly,
            salesSummaryQuarterly: salesSummaryQuarterly
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
        });
    }
}



// Function to fetch sales data for the specified interval
const salesBarchart = async (req, res) => {
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

            // Fetch sales data from the database for the specified interval and business
            const sales = await salesModel.find({
                userId: userId,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            // Initialize salesData object with all required keys set to zero
            const initializeSalesData = (interval) => {
                const salesData = {};

                if (interval === 'weekly') {
                    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    daysOfWeek.forEach(day => {
                        salesData[day] = 0;
                    });
                } else if (interval === 'monthly') {
                    const months = moment.monthsShort();
                    months.forEach(month => {
                        salesData[month] = 0;
                    });
                } else if (interval === 'quarterly') {
                    for (let i = 1; i <= 4; i++) {
                        salesData[`Q${i}`] = 0;
                    }
                }

                return salesData;
            }

            // Group sales data based on the interval
            const groupSalesData = (sales, salesData, interval) => {
                sales.forEach(sale => {
                    let key;
                    if (interval === 'weekly') {
                        key = moment(sale.createdAt).format('ddd');
                    } else if (interval === 'monthly') {
                        key = moment(sale.createdAt).format('MMM');
                    } else if (interval === 'quarterly') {
                        key = `Q${moment(sale.createdAt).quarter()}`;
                    }
                    salesData[key] += sale.total;
                });
            }

            // Process the data and calculate total sales
            const salesData = initializeSalesData(interval);

            // Group sales data based on the interval
            groupSalesData(sales, salesData, interval);

            // Add sales data to the response object
            responseData[interval] = salesData;
        }


        return res.status(200).json({
            message: "Sales data for weekky, monthly and quarterly",
            data: responseData
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error' + error.message
        });
    }
};




const SalesPurchaseSummary = async (req, res) => {
    try {

        const userId = req.params.userId;
        const sales = await salesModel.find({ userId: userId });

        const currentWeek = moment().isoWeek();
        const currentYear = moment().isoWeekYear();

        // Initialize monthly, and quarterly sales objects with zeros
        const monthlySales = {};
        const quarterlySales = {};

        // Fill monthlySales and quarterlySales objects with zeros
        for (let i = 0; i < 12; i++) {
            const monthName = moment().month(i).format('MMMM');
            monthlySales[monthName] = 0;
        }
        for (let i = 1; i <= 4; i++) {
            quarterlySales[`Quarter ${i}`] = 0;
        }

        // Initialize daily sales object for the current week
        const dailySales = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0
        };

        // Iterate through sales data and aggregate sales
        sales.forEach(sale => {
            const createdAt = moment(sale.createdAt);
            const weekNumber = createdAt.isoWeek();
            const year = createdAt.isoWeekYear();
            const monthName = createdAt.format('MMMM');
            const quarterNumber = Math.floor((createdAt.month() - 1) / 3) + 1;

            if (weekNumber === currentWeek && year === currentYear) {
                const dayOfWeek = createdAt.format('dddd');
                dailySales[dayOfWeek] += sale.total;
            }
            monthlySales[monthName] += sale.total;
            quarterlySales[`Quarter ${quarterNumber}`] += sale.total;
        });

        const salesSummary = {
            dailySales,
            monthlySales,
            quarterlySales
        };

        const orders = await orderModel.find({ userId: userId });

        // Initialize monthly, and quarterly Orders objects with zeros
        const monthlyOrder = {};
        const quarterlyOrder = {};

        // Fill monthlyOrder and quarterlyOrder objects with zeros
        for (let i = 0; i < 12; i++) {
            const monthName = moment().month(i).format('MMMM');
            monthlyOrder[monthName] = 0;
        }
        for (let i = 1; i <= 4; i++) {
            quarterlyOrder[`Quarter ${i}`] = 0;
        }

        // Initialize daily Orders object for the current week
        const dailyOrder = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0
        };

        // Iterate through orders data and aggregate orders
        orders.forEach(order => {
            const createdAt = moment(order.createdAt);
            const weekNumber = createdAt.isoWeek();
            const year = createdAt.isoWeekYear();
            const monthName = createdAt.format('MMMM');
            const quarterNumber = Math.floor((createdAt.month() - 1) / 3) + 1;

            if (weekNumber === currentWeek && year === currentYear) {
                const dayOfWeek = createdAt.format('dddd');
                dailyOrder[dayOfWeek] += order.totalAmount;
            }
            monthlyOrder[monthName] += order.totalAmount;
            quarterlyOrder[`Quarter ${quarterNumber}`] += order.totalAmount;
        });

        const orderSummary = {
            dailyOrder,
            monthlyOrder,
            quarterlyOrder
        };

        const sumData = (sales, orders) => {
            const dailyTotal = {};
            const monthlyTotal = {};
            const quarterlyTotal = {};
        
            // Summing up daily sales and orders
            for (const day in sales.dailySales) {
                dailyTotal[day] = sales.dailySales[day] + orders.dailyOrder[day];
            }
        
            // Summing up monthly sales and orders
            for (const month in sales.monthlySales) {
                monthlyTotal[month] = sales.monthlySales[month] + orders.monthlyOrder[month];
            }
        
            // Summing up quarterly sales and orders
            for (const quarter in sales.quarterlySales) {
                quarterlyTotal[quarter] = sales.quarterlySales[quarter] + orders.quarterlyOrder[quarter];
            }
        
            return { dailyTotal, monthlyTotal, quarterlyTotal };
        }        
        
        const totals = sumData(salesSummary, orderSummary);

        const purchases = await purchaseModel.find({ userId: userId });

        // Initialize monthly, and quarterly Purchases objects with zeros
        const monthlyPurchase = {};
        const quarterlyPurchase = {};

        // Fill monthlyPurchase and quarterlyPurchase objects with zeros
        for (let i = 0; i < 12; i++) {
            const monthName = moment().month(i).format('MMMM');
            monthlyPurchase[monthName] = 0;
        }
        for (let i = 1; i <= 4; i++) {
            quarterlyPurchase[`Quarter ${i}`] = 0;
        }

        // Initialize daily Purchases object for the current week
        const dailyPurchase = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0
        };

        // Iterate through purchases data and aggregate purchases
        purchases.forEach(purchase => {
            const createdAt = moment(purchase.createdAt);
            const weekNumber = createdAt.isoWeek();
            const year = createdAt.isoWeekYear();
            const monthName = createdAt.format('MMMM');
            const quarterNumber = Math.floor((createdAt.month() - 1) / 3) + 1;

            if (weekNumber === currentWeek && year === currentYear) {
                const dayOfWeek = createdAt.format('dddd');
                dailyPurchase[dayOfWeek] += purchase.totalAmount;
            }
            monthlyPurchase[monthName] += purchase.totalAmount;
            quarterlyPurchase[`Quarter ${quarterNumber}`] += purchase.totalAmount;
        });

        const purchaseSummary = {
            dailyPurchase,
            monthlyPurchase,
            quarterlyPurchase
        };

        const weeklyrecord = [];
        const monthlyrecord = [];
        const quarterlyrecord = [];

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = moment.months();
        const quarters = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];

        daysOfWeek.forEach(day => {
            const salesAmount = totals.dailyTotal[day];
            const purchaseAmount = purchaseSummary.dailyPurchase[day];
            weeklyrecord.push({
                day: day,
                sales: salesAmount || 0,
                purchases: purchaseAmount || 0
            });
        });        

        months.forEach(month => {
            const salesAmount = totals.monthlyTotal[month];
            const purchaseAmount = purchaseSummary.monthlyPurchase[month];
            monthlyrecord.push({
                month: month,
                sales: salesAmount || 0,
                purchases: purchaseAmount || 0
            });
        });

        quarters.forEach(quarter => {
            const salesAmount = totals.quarterlyTotal[quarter];
            const purchaseAmount = purchaseSummary.quarterlyPurchase[quarter];
            quarterlyrecord.push({
                quarter: quarter,
                sales: salesAmount || 0,
                purchases: purchaseAmount || 0
            });
        });

        return res.status(200).json({
            message: "Sales and Purchase data fetched successfully: ",
            weeklyrecord: weeklyrecord,
            monthlyrecord: monthlyrecord,
            quarterlyrecord: quarterlyrecord
        });

    } catch (error) {
        return res.status(500).json({ 
            message: 'Internal Server Error: ' + error.message 
        });
    }
}




module.exports = {
    recordSales,
    viewSale,
    viewAllSales,
    updateSales,
    deleteSales,
    salesSummary,
    salesBarchart,
    SalesPurchaseSummary,

}