const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const connectionRequestSchema = new Schema({
        fromUserId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        toUserId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["ignored", "interested", "accepted", "rejected"],
                message: `{value} is not a valid status`
            }
        }
    },
    {timestamps: true}
)

connectionRequestSchema.index({fromUserId: 1, toUserId: 1});

// connectionRequestSchema.pre("save", function (next) {
//     const connectionRequest = this;
//     if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
//         throw new Error("Cannot send request to yourself")
//     }
//     next();
// })

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema)