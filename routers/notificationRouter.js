const express = require('express');

const router = express.Router();

const { viewANotification, viewAllNotification, deleteNotification, } = require('../controllers/notifications');
const { authenticate, authorizeRole } = require('../middleware/authentation');


//endpoint to view a particular notification 
router.get('/view-a-notification/:notificationId', authenticate, viewANotification);

//endpoint to view all notifications 
router.get('/view-notifications/:userId', authenticate, viewAllNotification);

//endpoint to delete a particular notification 
router.delete('/delete-notification/:notificationId/:userId', authenticate, authorizeRole('manager'), deleteNotification);



module.exports = router;