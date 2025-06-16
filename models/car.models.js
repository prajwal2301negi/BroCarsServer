import mongoose from 'mongoose'
import validator from 'validator'

const carSchema = new mongoose.Schema({
    make: String,
    model: String,
    variant: String,
    year: Number,
    price: Number,
    displayImg: {
        public_id: String,
        url: String
    },
    image2Avatar: {
        public_id: String,
        url: String
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    image3Avatar: {
        public_id: String,
        url: String
    },
    image4Avatar: {
        public_id: String,
        url: String
    },
    fuel: String,
    transmission: String,
    kms: Number,
    location: String,   
    owner: {
        type: String,
        // enum: ["First", "Second", "Third"]
    },
    color: String,
    bodyType: String,
    engine: String,
    mileage: String,
    seatingCapacity: {
        type: String,
        // enum: ["2", "5", "7", "9"]
    },
    registrationNumber: String,
    registrationState: String,
    insuranceValidity: String,
    specifications: {
        bootSpace: String,
        groundClearance: String,
        length: String,
        width: String,
        height: String,
    },
    verified: Boolean,
    inspectionReport: {
        exterior: String,
        interior: String,
        engine: String,
        electrical: String,
        ac: String,
        tyres: String,
    },
    testDrive: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            approved: {
                type: Boolean,
                default: false,
            },
            day:{
                type: String
            },
            time:{
                type:String
            },
            name:{
                type:String
            },
            phone:{
                type:String
            }
        }
    ]
}, {
    timestamps: true
});

const car = mongoose.model('Car', carSchema);
export default car;