import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, "Name must contain atleast 3 characters"],
        maxLength: [30, "Name must contain maximum 30 characters"],
    },
    email: {
        type: String,
        unique: true,
        validate: [validator.isEmail, "Enter validate email address"],
    },
    password: {
        type: String,
        minLength: [8, "Password must be atleast 8 characters"],
        select: false,
    },
    gender: {
        type: String,
        enum: {
            values: ["Male", "Female", "Other"],
            message: "Please select gender",
        },
    },
    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    phone: {
        type: String,
        validator: ((value) => {
            return value.minLength = 10;
        }),
    },
    token: {
        type: String,
    },
    role: {
        type: String,
        enum: {
            values: ["User", "Admin"],
            message: "Please select role",
        },
    },
    accountVerified: {
        type: Boolean,

    },
    buy:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Car'
    }],
    sell:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Car'
    }],
    address:{
        street: String,
        city: String,
        houseNo: String,
        pinCode: Number
    },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});



const user = mongoose.model("User", userSchema);
export default user;