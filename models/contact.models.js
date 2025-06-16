import mongoose from 'mongoose'
import validator from 'validator'

const contactSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    message:{
        type:String,
        required:true,
        maxLength:[100, "Message should not exceed 100 words"]
    },
    email:{
        type:String,
        validate: [validator.isEmail, "Enter a valid Email"],
    },
    subject:{
        type:String,
        minLength: [3, "Subject must contain atleast 3 characters"],
    },
    phone:{
        type:String,
        validator: ((value) => {
            return value.minLength = 10;
        }),
    }, 
    inquiryType:{
        type:String,
    }
},{
    timestamps: true
})

const contact = mongoose.model('Contact',contactSchema)
export default contact