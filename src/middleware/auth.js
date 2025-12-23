const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req,res,next) => {
    try {
        const {token} = req.cookies;

        if(!token){
            throw new Error("No token found");
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, JWT_SECRET, {expiresIn: '1d'});
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }
        req.user = user;
        next();

    } catch (error){
        res.status(401).json({message: error.message});
    }
}

module.exports = {
    userAuth
};