const express = require('express');
const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();


userRouter.get('/user/requests/received', userAuth, async (req,res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status : "interested"
        }).populate("fromUserId", ["firstName","lastName", "photoUrl"]);

        res.json({
            message: "Requests fetched successfully",
            data: connectionRequest
        })
    } catch (err){
        res.status(400).send("Error " + err.message);
    }
})

userRouter.get('/user/connections', userAuth, async (req,res)=>{
    try{
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find({
            $or : [
                { toUserId : loggedInUser._id, status: "accepted"},
                { fromUserId : loggedInUser._id, status: "accepted"}
            ]
        }).populate("fromUserId", ["firstName","lastName", "photoUrl" , "gender", "age"]);

        const data = connectionRequest.map((row)=> row.fromUserId)

        res.json({
            message: "Connections fetched successfully",
            data
        })

    } catch (err){
        res.status(400).send("Error " + err.message);
    }
})

module.exports = userRouter;