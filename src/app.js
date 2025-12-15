require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser')
const User = require('./models/user');
const {validateSignupData} = require('./utils/validation');
const jwt = require('jsonwebtoken');
const {userAuth} = require('./middleware/auth');

app.use(express.json()); // parse application/json to req.body
app.use(express.urlencoded({extended:false})); // parse application/x-www-form-urlencoded
app.use(cookieParser());

app.post('/signup',async (req,res)=>{
    try{
        // validate user data
        validateSignupData(req);

        // Encrypt password
        const {firstName, lastName, emailId, password} = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User( {
            firstName,
            lastName,
            emailId,
            password: passwordHash
        });

        await user.save();
        res.send("User created successfully");
    } catch(err){
        res.status(400).send("Error: " + err.message);
    }
})

app.post('/login', async  (req,res) => {
    try {

        const {emailId, password} = req.body;

        const user = await User.findOne({emailId: emailId});
        if(!user){
            throw new Error("User not found");
        }
        const passwordValid = bcrypt.compareSync(password, user.password);

        if(passwordValid){

            const token = jwt.sign({userId: user._id}, "DevTinder@123");
            console.log(token);

            res.cookie("token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
            });
            res.send("Logged in successfully");

        } else {
            throw new Error("Invalid password");
        }
    }catch (err){
        res.status(400).send("Error logging in" + err.message);
    }

})

app.get('/profile',userAuth, async (req,res)=>{

    try {
       const user = req.user
        res.send(user);
    } catch (err) {
        res.status(400).send("Error " + err.message);
    }

})

app.post('/sendConnectionRequest',userAuth, async (req,res)=>{
    res.send("Connection request sent successfully");
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

app.delete('/user/:id', async (req,res)=>{
    const userId = req.params.id;
    try{
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted successfully "+ user);

    }catch (err){
        res.status(400).send("Error deleting user" + err);
    }
})

app.patch('/user/:id', async (req,res)=>{
    const userId = req.params?.id;
    const data = req.body;

    try{
        const ALLOWED_FIELDS = ['firstName', 'lastName', 'age', 'gender', 'photoUrl', 'about', 'skills'];

        const updatedFields = Object.keys(data).every(key => ALLOWED_FIELDS.includes(key));

        if(!updatedFields){
            return res.status(400).send("No fields to update");
        }

        const user = await User.findByIdAndUpdate(userId, data, {
            returnDocument : 'after',
            runValidators : true
        });
        res.send("User updated successfully "+ user);
    }catch (err){
        res.status(400).send("Error updating user" + err.message);
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
