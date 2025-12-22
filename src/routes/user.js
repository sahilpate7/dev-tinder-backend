const express = require('express');
const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

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
        })
            .populate("fromUserId", ["firstName","lastName", "photoUrl" , "gender", "age"])
            .populate("toUserId", ["firstName","lastName", "photoUrl" , "gender", "age"])


        const data = connectionRequest.map((row)=> {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
        })

        res.json({
            message: "Connections fetched successfully",
            data
        })

    } catch (err){
        res.status(400).send("Error " + err.message);
    }
})

userRouter.get('/feed', userAuth, async (req,res)=>{
    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {fromUserId : loggedInUser._id},
                {toUserId : loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach(req => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        })

        const users = await User.find({
            $and : [
                {_id : {$nin : Array.from(hideUsersFromFeed)}},
                {_id : {$ne : loggedInUser._id}}
            ]
        }).select("firstName lastName photoUrl skills age gender").skip(skip).limit(limit);

        res.json({data : users, message: "Feed fetched successfully"});
    } catch (err){
        res.status(400).send("Error " + err.message);
    }
})

module.exports = userRouter;