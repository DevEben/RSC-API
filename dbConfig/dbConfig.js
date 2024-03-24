const mongoose = require('mongoose');
require('dotenv').config();

const url = process.env.DATABASE;

mongoose.connect(url)
.then(() => {
    console.log('Connection to database established successfully')
})
.catch((error) => {
    console.log('Error connecting to database:  ' +error.message);
})

module.exports = mongoose.connection;
