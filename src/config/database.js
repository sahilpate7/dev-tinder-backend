const mongoose = require('mongoose');

const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://m001-student:m001-mongodb-basics@namastedev.qr05pko.mongodb.net/devTinder');
}

module.exports = connectDB;