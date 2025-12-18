const  express = require('express');
const {userAuth} = require("../middleware/auth");
const {validateProfileData} = require("../utils/validation");
const validator = require('validator');
const bcrypt = require("bcrypt");
const profileRouter = express.Router();

profileRouter.get('/profile/view', userAuth, async (req,res)=>{
    try {
        const user = req.user
        res.send(user);
    } catch (err) {
        res.status(400).send("Error " + err.message);
    }
})

profileRouter.patch('/profile/edit', userAuth, async (req,res)=>{
    try {
        if (!validateProfileData(req)){
            throw new Error("Invalid data");
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach(field => loggedInUser[field] = req.body[field]);

        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}'s, profile updated successfully`,
            data : loggedInUser
        });

    } catch (err){
        console.log(err);
        res.status(400).send("Error " + err.message);
    }

})

profileRouter.patch('/profile/password', userAuth, async (req,res)=>{
    try {
       const {password} = req.body;

       if(!password){
           throw new Error("Password is required");
       }

        const isValid = validator.isStrongPassword(password);

        if(!isValid){
            throw new Error("Password is too weak");
        }

        const user = req.user;
        const hashPassword = await bcrypt.hash(password, 10);

        user.password = hashPassword;
        await user.save();

        res.json({
            message: "Password updated successfully"
        });

    } catch (err){
        res.status(400).send("Error " + err.message);
    }

})

module.exports = profileRouter;