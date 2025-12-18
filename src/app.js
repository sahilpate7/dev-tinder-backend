require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestsRouter = require('./routes/request');

app.use(express.json()); // parse application/json to req.body
app.use(express.urlencoded({extended:false})); // parse application/x-www-form-urlencoded
app.use(cookieParser());

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestsRouter);

// connect database
connectDB().then(()=>{
    console.log('Database connected');
    app.listen(3000,()=>{
        console.log('Server is running on port 3000');
    });
}).catch(err=>{
    console.log("Database cannot be connected" + err);
})
