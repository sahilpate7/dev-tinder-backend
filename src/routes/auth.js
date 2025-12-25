const express = require('express');
const {validateSignupData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post('/signup',async (req,res)=>{
    try{
        // validate user data
        validateSignupData(req);

        // Encrypt password
        const {firstName, lastName, emailId, password, age, gender, photoUrl, about,  skills} = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User( {
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            photoUrl,
            about,
            skills
        });

        const savedUser = await user.save();

        const token = await savedUser.getJwtToken();

        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
        });

        res.json({message: "User created successfully", data: savedUser});
    } catch(err){
        res.status(400).json({error: err.message});
    }
})

authRouter.post('/login', async  (req,res) => {
    try {

        const {emailId, password} = req.body;

        const user = await User.findOne({emailId: emailId});
        if(!user){
            throw new Error("User not found");
        }
        const passwordValid = await user.validatePassword(password)

        if(passwordValid){

            const token = await user.getJwtToken();

            res.cookie("token", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
            });
            res.status(200).json({message: "Logged in successfully", data: user});

        } else {
            throw new Error("Invalid password");
        }
    }catch (err){
        res.status(400).json({error: err.message});
    }

})

authRouter.post('/logout', (req,res)=>{
    res.cookie("token", null, {expires: new Date(0)});
    res.send("Logged out successfully");
})

module.exports = authRouter;