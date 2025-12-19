const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {Schema} = mongoose;

const userSchema = new Schema({
        firstName: {
            type: String,
            required: true,
            maxLength: 20,
            minLength: 2
        },
        lastName: {
            type: String
        },
        emailId: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid ' + value);
                }
            }
        },
        password: {
            type: String,
            required: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error('Password is too weak');
                }
            }
        },
        age: {
            type: Number,
            min: 18,
            max: 50
        },
        gender: {
            type: String,
            lowercase: true,
            validate(value) {
                if (!["male", "female", "other"].includes(value)) throw new Error('Gender must be either male, female or other');
            },
        },
        photoUrl: {
            type: String,
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error('URL is invalid ' + value);
                }
            }
        },
        about: {
            type: String,
            default: "No about provided"
        },
        skills: {
            type: [String],
            validate(value) {
                if (value.length > 5) throw new Error('Only 5 skills allowed');
            }
        }
    },
    {
        timestamps: true
    }
);

userSchema.index({firstName: 1, lastName: 1});

userSchema.methods.getJwtToken = async function () {
    const user = this;
    const JWT_SECRET = process.env.JWT_SECRET;
    return jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: '1d'});
}
userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    return await bcrypt.compareSync(passwordInputByUser, passwordHash);

}
module.exports = mongoose.model('User', userSchema);