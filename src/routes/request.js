const  express = require('express');
const {userAuth} = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestsRouter = express.Router();

requestsRouter.post('/request/send/:status/:toUserId',userAuth, async (req,res)=>{
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        console.log("toUserId: " + toUserId + " status: " + status + " fromUserId: " + fromUserId + "");

        const allowedStatuses = ["ignored", "interested"];
        if (!allowedStatuses.includes(status)){
            return res.status(400).json({
                message: "Invalid status type: " + status
            });
        }

        // Implemented this check in the Schema: check connectionRequest.js
        if (fromUserId === toUserId){
            res.status(400).json({
                message: "Cannot send request to yourself"
            })
        }

        const toUser = await User.findById(toUserId);
        // console.log(toUser);

        if (!toUser){
            return res.status(400).json({
                message: "User not found"
            })
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or : [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })

        if (existingConnectionRequest){
            return res.status(400).json({
                message: "Connection request already exists"
            })
        }



        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

       const data = await connectionRequest.save();

       res.json({
           message: `${status} request sent successfully`,
           data
       })
    } catch (err){
        res.status(400).send("Error " + err.message);
    }
});

requestsRouter.post('/request/review/:status/:requestId', userAuth, async (req,res)=>{
    try{
        const loggedInUser = req.user;
        const status = req.params.status;
        const requestId = req.params.requestId;

        const allowedStatuses = ["accepted", "rejected"];
        if (!allowedStatuses.includes(status)){
            return res.status(400).json({
                message: "Invalid status type: " + status
            });
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        });

        if (!connectionRequest){
            res.status(400).json({
                message: "Request not found"
            })
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.json({
            message: `${status} request updated successfully`,
            status,
            data: data
        })

    } catch (err){
        res.status(400).send("Error " + err.message);
    }
})

module.exports = requestsRouter;