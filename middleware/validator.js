const joi = require('@hapi/joi');

const today = new Date();
today.setHours(0, 0, 0, 0); // Set time to midnight (00:00:00)

const validateUser = (data) => {
    try {
        const validateSchema = joi.object({
            businessName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_\-!@#$%^&*()]*$/).trim().required().messages({
                'string.empty': "Business Name field can't be left empty",
                'string.min': "Minimum of 3 characters for the Business Name field",
                'string.max': "Maximum of 30 characters long for the Business Name field",
                "string.pattern.base": "Please enter a valid business name",
                'any.required': "Please Business Name is required"
            }),
            email: joi.string().max(50).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            phoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).required().messages({
                'string.empty': "Phone number field can't be left empty",
                'string.min': "Phone number must be atleast 11 digit long e.g: 08123456789",
                'string.pattern.base': "Phone number must be atleast 11 digit long e.g: 08123456789",
                'any.required': "Please phone number is required"
            }),
            password: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
            confirmPassword: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).valid(joi.ref('password')).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required",
                'any.only': 'Passwords do not match',
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateUserLogin = (data) => {
    try {
        const validateSchema = joi.object({
            email: joi.string().max(50).trim().email( {tlds: {allow: false} } ).messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            password: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateUserForgotPassword = (data) => {
    try {
        const validateSchema = joi.object({
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            })
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateResetPassword = (data) => {
    try {
        const validateSchema = joi.object({
            password: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
            confirmPassword: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).valid(joi.ref('password')).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required",
                'any.only': 'Passwords do not match',
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}


const validateUserUpdate = (data) => {
    try {
        const validateSchema = joi.object({
            firstName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().messages({
                'string.empty': "First name field can't be left empty",
                'string.min': "Minimum of 3 characters for the first name field",
            }),
            lastName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
            }),
            // businessName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
            //     'string.empty': "Business Name field can't be left empty",
            //     'string.min': "Minimum of 3 characters for the Business Name field",
            // }),
            phoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).messages({
                'string.empty': "Phone number field can't be left empty",
                'string.min': "Phone number must be atleast 11 digit long e.g: 08123456789",
                'any.required': "Please phone number is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}


const validateUserSubscribe = (data) => {
    try {
        const validateSchema = joi.object({
            email: joi.string().max(40).trim().email( {tlds: {allow: false} } ).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            })
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}


const validateProductInput = (data) => {
    try {
        const validateSchema = joi.object({
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Product Name field can't be left empty",
                'string.min': "Minimum of 3 characters for the Product Name field",
                'any.required': "Please Product Name is required"
            }),
            category: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "category field can't be left empty",
                'string.min': "Minimum of 3 characters for the category field",
                'any.required': "Please category is required"
            }),
            brand: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Brand field can't be left empty",
                'string.min': "Minimum of 3 characters for the brand field",
                'any.required': "Please brand is required"
            }),
            productDescription: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Product description field can't be left empty",
                'string.min': "Minimum of 3 characters for the Product description field",
                'any.required': "Please Product description is required"
            }),
            costPrice: joi.number().min(1).required().messages({
                'number.empty': "Cost Price field can't be left empty",
                'number.min': "Minimum of 3 characters for the Cost Price field",
                'any.required': "Please Cost Price is required"
            }),
            sellingPrice: joi.number().min(1).required().messages({
                'number.empty': "Selling Price field can't be left empty",
                'number.min': "Minimum of 3 characters for the Selling Price field",
                'any.required': "Please Selling Price is required"
            }),
            stockQty: joi.number().min(1).required().messages({
                'number.empty': "Stock quantity field can't be left empty",
                'number.min': "Minimum of 3 characters for the Stock quantity field",
                'any.required': "Please Stock quantity is required"
            }),
            VAT: joi.number().min(0).messages({
                'number.empty': "VAT field can't be left empty",
                'number.min': "Minimum of 3 characters for the VAT field",
                'any.required': "Please VAT is required"
            }),
            reorderLevel: joi.number().min(1).required().messages({
                'number.empty': "Reorder level field can't be left empty",
                'number.min': "Minimum of 3 characters for the Reorder level field",
                'any.required': "Please Reorder level is required"
            }),

        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateProductUpdate = (data) => {
    try {
        const validateSchema = joi.object({
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Product Name field",
            }),
            category: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the category field",
            }),
            brand: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the brand field",
            }),
            productDescription: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Product description field",
                'any.required': "Please Product description is required"
            }),
            costPrice: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Cost Price field",
            }),
            sellingPrice: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Selling Price field",
            }),
            stockQty: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Stock quantity field",
            }),
            VAT: joi.number().min(0).messages({
                'number.min': "Minimum of 3 characters for the VAT field",
                'any.required': "Please VAT is required"
            }),
            reorderLevel: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Reorder level field",
            }),

        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateSalesInput = (data) => {
    try {
        const validateSchema = joi.object({
            // sales: joi.array().items(
            //     joi.object({
            itemName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Item Name field can't be left empty",
                'string.min': "Minimum of 3 characters for the Item Name field",
                'any.required': "Please Item Name is required"
            }),
            itemDescription: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Item Description field can't be left empty",
                'string.min': "Minimum of 3 characters for the Item Description field",
                'any.required': "Please Item Description is required"
            }),
            quantity: joi.number().min(1).required().messages({
                'number.empty': "Quantity field can't be left empty",
                'number.min': "Minimum of 3 characters for the Quantity field",
                'any.required': "Please Quantity is required"
            }),
            // VAT: joi.number().min(1).messages({
            //     'number.empty': "Value Added Tax field can't be left empty",
            //     'number.min': "Minimum of 3 characters for the Value Added Tax field",
            // }),
        })
    //     )
    // })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateSalesUpdate = (data) => {
    try {
        const validateSchema = joi.object({
            itemName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Item Name field",
            }),
            itemDescription: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Item Description field",
            }),
            quantity: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Quantity field",
            }),
            // VAT: joi.number().min(1).messages({
            //     'number.empty': "Value Added Tax field can't be left empty",
            //     'number.min': "Minimum of 3 characters for the Value Added Tax field",
            // }),

        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validatePurchaseInput = (data) => {
    try {
        const validateSchema = joi.object({
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Product Name field can't be left empty",
                'string.min': "Minimum of 3 characters for the Product Name field",
                'any.required': "Please Product Name is required"
            }),
            supplierName: joi.string().min(3).max(30).regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/).trim().required().messages({
                'string.empty': "Supplier name field can't be left empty",
                'string.min': "Minimum of 3 characters for the supplier name field",
                'any.required': "Please supplier name is required"
            }),
            supplierPhoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).required().messages({
                'string.empty': "Supplier Phone number field can't be left empty",
                'string.min': "Supplier Phone number must be atleast 11 digit long e.g: 08123456789",
                'any.required': "Please supplier phone number is required"
            }),
            unitPrice: joi.number().min(1).required().messages({
                'number.empty': "Unit price field can't be left empty",
                'number.min': "Minimum of 3 characters for the Unit price field",
                'any.required': "Please Unit price is required"
            }),
            quantityOrder: joi.number().min(1).required().messages({
                'number.empty': "Quantity order field can't be left empty",
                'number.min': "Minimum of 3 characters for the Quantity order field",
                'any.required': "Please Quantity order is required"
            }),
            dateOrder: joi.date().iso().min(today).required().messages({
                'date.min': 'The date must be present date or later date.',
                'any.required': "Please Date order is required",
            }),
            quantityRecieved: joi.number().min(1).messages({
                'number.empty': "Quantity received field can't be left empty",
                'number.min': "Minimum of 3 characters for the Quantity received field",
            }),
            expectedDate: joi.date().iso().min(today).required().messages({
                'date.min': 'The date must be equal to or later than the current date.',
                'any.required': "Please expected date is required",
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {  
        throw error
    }
}



const validatePurchaseUpdate = (data) => {
    try {
        const validateSchema = joi.object({
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Product Name field",
            }),
            supplierName: joi.string().min(3).max(30).regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the supplier name field",
            }),
            supplierPhoneNumber: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).messages({
                'string.min': "Supplier Phone number must be atleast 11 digit long e.g: 08123456789",
            }),
            unitPrice: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Unit price field",
            }),
            quantityOrder: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Quantity order field",
            }),
            totalAmount: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the total amount field",
            }),
            dateOrder: joi.date().iso().min(today).messages({
                'date.base': 'The date must be of the format YYYY-MM-DD',
                'date.min': 'The date must be present date or later date.',
            }),
            quantityReceived: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Quantity received field",
            }),
            expectedDate: joi.date().iso().min(today).messages({
                'date.base': 'The date must be of the format YYYY-MM-DD',
                'date.min': 'The date must be present date or later date.',
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateOrderInput = (data) => {
    try {
        const validateSchema = joi.object({
            customerName: joi.string().min(3).max(30).regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/).trim().required().messages({
                'string.empty': "Customer name field can't be left empty",
                'string.min': "Minimum of 3 characters for the customer name field",
                'any.required': "Please customer name is required"
            }),
            orderDate: joi.date().iso().min(today).required().messages({
                'date.min': 'The date must be equal to or later than the current date.',
                'any.required': "Please Order Date is required",
            }),
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().required().messages({
                'string.empty': "Product Name field can't be left empty",
                'string.min': "Minimum of 3 characters for the Product Name field",
                'any.required': "Please Product Name is required"
            }),
            unitPrice: joi.number().min(1).messages({
                'number.empty': "Unit price field can't be left empty",
                'number.min': "Minimum of 3 characters for the Unit price field",
            }),
            quantity: joi.number().min(1).required().messages({
                'number.empty': "Quantity field can't be left empty",
                'number.min': "Minimum of 3 characters for the Quantity field",
                'any.required': "Please Quantity is required"
            }),
            paymentStatus: joi.string().min(4).max(30).valid("Paid", "Not-Paid", "Pending").trim().messages({
                'string.empty': "Payment status field can't be left empty",
                'string.min': "Minimum of 4 characters for the Payment Name field",
                'any.only': 'Invalid value for Payment status. Allowed values are "Paid", "Not-Paid", or "Pending".',
            }),
            shipmentStatus: joi.string().min(4).max(30).valid("Shipped", "Not-Shipped", "Pending").trim().messages({
                'string.empty': "Shipment status field can't be left empty",
                'string.min': "Minimum of 4 characters for the Shipment Name field",
                'any.only': 'Invalid value for Shipment status. Allowed values are "Shipped", "Not-Shipped", or "Pending".',
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {  
        throw error
    }
}



const validateOrderUpdate = (data) => {
    try {
        const validateSchema = joi.object({
            customerName: joi.string().min(3).max(30).regex(/^[A-Za-z]+(?: [A-Za-z]+)*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the customer name field",
            }),
            orderDate: joi.date().iso().min(today).messages({
                'date.min': 'The date must be equal to or later than the current date.',
            }),
            productName: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_-]*$/).trim().messages({
                'string.min': "Minimum of 3 characters for the Product Name field",
            }),
            unitPrice: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Unit price field",
            }),
            quantity: joi.number().min(1).messages({
                'number.min': "Minimum of 3 characters for the Quantity field",
            }),
            paymentStatus: joi.string().min(4).max(30).valid("Paid", "Not-Paid", "Pending").trim().messages({
                'string.min': "Minimum of 4 characters for the Payment Name field",
                'any.only': 'Invalid value for Payment status. Allowed values are "Paid", "Not-Paid", or "Pending".',
            }),
            shipmentStatus: joi.string().min(4).max(30).valid("Shipped", "Not-Shipped", "Pending").trim().messages({
                'string.min': "Minimum of 4 characters for the Shipment Name field",
                'any.only': 'Invalid value for Shipment status. Allowed values are "Shipped", "Not-Shipped", or "Pending".',
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {  
        throw error
    }
}




module.exports = {
    validateUser,
    validateUserLogin,
    validateResetPassword,
    validateUserForgotPassword,
    validateUserUpdate,
    validateUserSubscribe,
    validateProductInput,
    validateProductUpdate,
    validateSalesInput,
    validateSalesUpdate,
    validatePurchaseInput,
    validatePurchaseUpdate,
    validateOrderInput,
    validateOrderUpdate,
}