const express = require('express');

const router = express.Router();

const { signUp, verify, resendOTP, logIn, forgotPassword, resetPassword, signOut, uploadLogo, updateBuiness, viewABuiness, viewBuiness, deleteBuiness, subscribePlan, } = require('../controllers/userController');
const { authenticate, authorizeRole } = require('../middleware/authentation');

//endpoint to register a new user
router.post('/signup', signUp);

//endpoint to verify a registered user
router.post('/verify/:id', verify);

//endpoint to resend new OTP to the user email address
router.get('/resend-otp/:id', resendOTP);

//endpoint to login a verified user
router.post('/login', logIn);

//endpoint for forget Password
router.post('/forgot', forgotPassword);

//endpoint to reset user Password
router.post('/reset-user/:userId', resetPassword);

//endpoint to sign out a user
router.post("/signout/:userId", authenticate, signOut);

//endpoint to upload an image logo
router.put('/upload/:id', authenticate, authorizeRole('owner'), uploadLogo );

//endpoint to update user profile
router.put('/update-profile/:userId', authenticate, authorizeRole('owner'), updateBuiness);

//endpoint to view a business in the database
router.get('/view-a-business/:userId', authenticate, viewABuiness);

//endpoint to view all business in the database
router.get('/view-business', authenticate, viewBuiness);

//endpoint to delete a business
router.delete('/delete-business', authenticate, authorizeRole('owner'), deleteBuiness);

//endpoint to subscribe to a plan
router.post('/subscribe/:userId', authenticate, authorizeRole('owner'), subscribePlan)



module.exports = router;