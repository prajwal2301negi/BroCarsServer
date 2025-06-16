import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import cloudinary from 'cloudinary';
import hpp from 'hpp';
import xss from 'xss-clean';
import helmet from 'helmet';
import sanitize from 'express-mongo-sanitize';
import {removeUnverifiedAccounts} from './automation/removeUnverifiedAccounts.js'

import { connection} from './database/dbConnection.js';
import ErrorHandler, { errorMiddleware } from './middlewares/errorMiddleware.js';

import userRouter from './routes/user.routes.js'
import adminRouter from './routes/admin.routes.js';
import contactRouter from './routes/contact.routes.js';
import carRouter from './routes/car.routes.js';


const app = express();

app.use(helmet());
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

app.use(sanitize());
app.use(xss());
app.use(hpp());


dotenv.config();
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true
}));

app.use(cookieParser());

app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
  
let limiter = rateLimit({
    max: 40,
    windowMs: 15 * 60 * 1000,
    message: 'We have received too many requests from this Address. Please try after 15 min.'
})

app.use(limiter);
removeUnverifiedAccounts()
connection();

app.use(errorMiddleware);

app.use('/api/v1/user',userRouter);
app.use('/api/v1/admin',adminRouter);
app.use('/api/v1/contact',contactRouter);
app.use('/api/v1/car', carRouter);

// app.all('*', asyncErrorHandler(async (req, res, next) => {
//   return next(new ErrorHandler("Page does not exist", 404));
// }));


const PORT = process.env.PORT || 4000

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})