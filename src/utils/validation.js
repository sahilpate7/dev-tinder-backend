const validator = require('validator');

const validateSignupData = (req) => {

    const {firstName, lastName, emailId, password} = req.body;

    if (!firstName || !lastName){
        throw new Error('First name and last name are required');
    } else if(!validator.isEmail(emailId)){
        throw new Error('Email is invalid');
    } else if (!validator.isStrongPassword(password)){
        throw new Error('Password is too weak');
    }

};

const validateProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"];

    return Object.keys(req.body).every(field => allowedEditFields.includes(field));
}

module.exports = {
    validateSignupData,
    validateProfileData
}