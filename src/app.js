const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');

app.use(express.json()); // parse application/json to req.body
app.use(express.urlencoded({extended:false})); // parse application/x-www-form-urlencoded

app.post('/signup',async (req,res)=>{
    const user = new User( req.body);

    try{
        await user.save();
        res.send("User created successfully");
    } catch(err){
        res.status(400).send("Error creating user" + err);
    }
})

// get user by email
app.get('/user',async (req,res)=>{
    const email = req.body.emailId;
    try{
        const users = await User.find({emailId : email});
        if(users.length === 0) {
            return res.status(404).send("No user found");
        } else {
            res.send(users);
        }

    } catch(err){
        res.status(400).send("Error fetching user" + err);
    }
})

// get all users
app.get('/feed', async (req,res)=>{
    try{
        const users = await User.find({});
        if(users.length === 0) {
            return res.status(404).send("No user found");
        } else {
            res.send(users);
        }

    } catch(err){
        res.status(400).send("Error fetching user" + err);
    }
})

// connect database
connectDB().then(()=>{
    console.log('Database connected');
    app.listen(3000,()=>{
        console.log('Server is running on port 3000');
    });
}).catch(err=>{
    console.log("Database cannot be connected" + err);
})
