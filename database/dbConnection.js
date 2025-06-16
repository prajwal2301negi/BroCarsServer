import mongoose from 'mongoose';

export const connection = () =>{
    mongoose.connect(process.env.MONGO,{
        dbName:"BROCARS"
    }).then(()=>{
        console.log("Connected to MongoDB")
    }).catch((err)=>{
        console.log(err);
    })
}