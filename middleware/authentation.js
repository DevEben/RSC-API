const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    try {
        const hasAuthorization = req.headers.authorization;
        if (!hasAuthorization) {
            return res.status(400).json({
                message: 'Invalid authorization',
            })
        }
        const token = hasAuthorization.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                message: "Token not found",
            });
        }
        const decodeToken = jwt.verify(token, process.env.SECRET)
        const user = await userModel.findById(decodeToken.userId);
        if (!user) {
            return res.status(404).json({
                message: "Not authorized: User not found",
            });
        }

        req.user = decodeToken;

        // Skip authentication for a specific route
        if (req.path === '/signout' || req.path === '/signout-staff') {
            return next();
        }


        // Check trial period
        const plan = user.plan; // Assuming user model has a field 'plan'
        const trialStart = user.createdAt; // Assuming user model has a field 'createdAt'
        const trialEnd = new Date(trialStart.getTime() + (1000 * 60 * 60 * 24 * 7)); // 7-day trial period

        if (plan === "free" && new Date() > trialEnd) {
            return res.status(403).json({
                message: "Trial period has expired. Please subscribe to continue.",
            });
        }

        next();
        
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError){
            return res.status(501).json({
                message: 'Session timeout, please login to continue',
            })
        }
        return res.status(500).json({
            Error: "Authentication error:  " + error.message,
        })        
    }
};



// Middleware to authorize based on roles
const authorizeRole = (role) => (req, res, next) => {
    authenticate(req, res, async () => {
        if (req.user.role !== role && req.user.role !== 'owner' && req.user.role !== 'manager') {
            return res.status(403).json({ 
                message: 'User not unauthorized to access this page!' 
            });
        }
        next();
    })
    }




module.exports = {
    authenticate,
    authorizeRole,

}