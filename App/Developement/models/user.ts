import mongoose from "mongoose";
const validate = require('mongoose-validator');

const nameValidator = [
    validate({
        validator: 'isLength',
        arguments: [1, 20],
        message: 'Name must be between 1 and 20 characters',
    }),
    validate({
        validator: 'isAlphanumeric',
        passIfEmpty: true,
        message: 'Name should contain alpha-numeric characters only',        
    })
]

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: nameValidator,
    },
    role: {
        type: String,
        required: true,
        default: "User"
    },
    password: {
        type: String,
        required: true,
    },
    date :{
        type : Date,
        default : Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;