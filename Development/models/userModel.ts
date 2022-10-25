import { model, Schema } from "mongoose";
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

interface IUser {
    name: string;
    role: string;
    password: string;
    creationDate: Date;
};

const UserSchema = new Schema<IUser>({
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
    creationDate: {
        type: Date,
        default: Date.now
    }
});

const UserModel = model<IUser>('User', UserSchema);

export { UserModel, IUser };