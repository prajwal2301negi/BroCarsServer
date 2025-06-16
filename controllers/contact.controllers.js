import Contact from "../models/contact.models.js";
import asyncErrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";



//save to contact
export const saveMessages = asyncErrorHandler(async(req, res, next)=>{
    const {name, message, email, phone, subject, inquiryType} = req.body;
    if(!name || !message || !email ||!phone ||!subject ||!inquiryType){
        return next(new ErrorHandler('Please fill in all fields', 400));
    }
    const contact = await Contact.create({name, message, email, subject, phone, inquiryType});
    res.status(201).json({success: true, contact});
})


// get messages from contact
export const getMessages = asyncErrorHandler(async (req, res, next)=>{
    const contacts = await Contact.find();
    if(!contacts){
        return next(new ErrorHandler('No contacts found', 404));
    }
    res.status(200).json({success: true, contacts});
})