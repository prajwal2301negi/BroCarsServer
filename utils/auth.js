import jwt from 'jsonwebtoken';
import asyncErrorHandler from '../middlewares/asyncErrorHandler.js';
import ErrorHandler from '../middlewares/errorMiddleware.js';
import User from '../models/user.models.js';

// ADMIN AUTHENTICATION AND AUTHORIZATION->
export const isAuthenticated = asyncErrorHandler(async (req, res, next) => {
    // AUTHENTICATION->
    const { tokena } = req.cookies
    if (!tokena) {
        return next(new ErrorHandler("Admin Not Authenticated", 401));
    }
    const decoded = jwt.verify(tokena, process.env.JWT_REFRESHTSECRETA);
    req.user = await User.findById(decoded.id);

    //AUTHORIZATION->
    if (req.user.role !== "Admin") {
        return next(
            new ErrorHandler(
                `${req.user.role} not submitted for this resources!`,
                403
            )
        );
    }
    next();
})




// USER AUTHNETICATION AND AUTHORIZATION->
export const isUserAuthenticated = asyncErrorHandler(async (req, res, next) => {
    // AUTHENTICATION->
    const { tokenu } = req.cookies

    // if (!tokenu) {
    //     return next(new ErrorHandler("User Not Authenticated", 401));
    // }
    if (!tokenu) {
    return res.status(401).json({ success: false, message: "User Not Authenticated" });
}

    const decoded = jwt.verify(tokenu, process.env.JWT_REFRESHTSECRETC);
    req.user = await User.findById(decoded.id);
    // if (!req.user) {
    //     return next(new ErrorHandler("Unauthorized", 400));
    // }
    if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
}


    // AUTHORIZATION->
    if (req.user.role !== "User") {
        return next(
            new ErrorHandler(
                `${req.user.role} not submitted for this resources!`,
                403
            )
        );
    }
    next();
})