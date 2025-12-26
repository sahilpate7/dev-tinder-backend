const mongoose = require('mongoose');

const connectDB = async () =>{
    const DB_URI = process.env.MONGODB_URI;
    await mongoose.connect(DB_URI);
}

module.exports = connectDB;