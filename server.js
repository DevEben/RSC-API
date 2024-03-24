const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { notifyLowStock, } = require('./controllers/notifications');
const productModel = require('./models/productModel');
require('dotenv').config();
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const router = require('./routers/userRouter');
const productRouter = require('./routers/productRouter');
const salesRouter = require('./routers/salesRouter');
const purchaseRouter = require('./routers/purchaseRouter');
const orderRouter = require('./routers/orderRouter');
const notificationsRouter = require('./routers/notificationRouter');
const db = require('./dbConfig/dbConfig');

// Set up Express server
const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = socketIo(server);


const port = process.env.PORT;

app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(fileUpload({
  useTempFiles: true,
  limits: { fileSize: 5 * 1024 * 1024 }
}));


// Set up MongoDB Change Streams
try {
  db.once('open', () => {
    const productCollection = db.collection('productmgts');

    // Change Stream for low stock in product collection
    const productChangeStream = productCollection.watch();
    productChangeStream.on('change', async (change) => {
      try {
        if ((change.operationType === 'update') &&
          change.updateDescription.updatedFields.stockQty !== undefined) {
          const product = await productModel.findById(change.documentKey._id);
          if (product && product.stockQty < product.reorderLevel) {
            const userId = product.userId;
            await notifyLowStock(userId, change.documentKey._id); // Notify low stock

            // Emit event to Socket.IO clients with notification message
            io.emit('lowStockStatusUpdate', { userId, productId: change.documentKey._id, details: notifyLowStock });
          }
        }
      } catch (error) {
        console.error("Error tracking product quantity: " + error.message);
      }
    });

  });

} catch (error) {
  console.error("Error establishing MongoDB Change Stream connection: " + error.message);
}

db.on('error', (error) => {
  console.error('MongoDB connection error:', error.message);
});




app.get('/', (req, res) => {
  res.send("Welcome to Rapid Stock Control API");
})
app.use('/api/', router);
app.use('/product', productRouter);
app.use('/sales', salesRouter);
app.use('/purchases', purchaseRouter);
app.use('/orders', orderRouter);
app.use('/notifications', notificationsRouter);


app.listen(port, () => {
  console.log(`Server up and running on port: ${port}`);
})