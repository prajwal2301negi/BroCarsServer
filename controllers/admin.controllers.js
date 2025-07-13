import asyncErrorHandler from '../middlewares/asyncErrorHandler.js'
import ErrorHandler from '../middlewares/errorMiddleware.js';
import User from '../models/user.models.js'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import cloudinary from 'cloudinary'
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmailer.js';
import { sendTokenAdmin } from '../utils/sendToken.js';

// Helper function: Validate phone number
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(phone);
}

// Helper function: Generate random verification code
function generateRandomFiveDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return parseInt(firstDigit + remainingDigits, 10);
}


async function sendVerificationCode( email, verificationCode, res) {
    
        try {
            const message = generateEmailTemplate(verificationCode);
            await sendEmail({ email, subject: "Your Verification Code", message });
            //   await client.lPush("email",JSON.stringify({email, subject: "YOUR VERIFICATION CODE", message}))

            // Respond with success if email is sent
            return res.status(200).json({
                success: true,
                message: "Verification code sent to your email",
            });
        } catch (error) {
            console.error('Error sending verification code via email:', error);

            // Send failure response but don't crash the server
            res.status(500).json({
                success: false,
                message: "Error sending verification code via email",
            });
        }
    }



// Helper function: Generate email template
function generateEmailTemplate(verificationCode) {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #007BFF; text-align: center;">Verification Code</h2>
            <p>Dear User,</p>
            <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
            <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #007BFF;">${verificationCode}</span>
            </div>
            <p>If you did not request this code, please ignore this email.</p>
            <p>Best regards,<br>Your Company Team</p>
        </div>
    `;
}

// verifyOTP function 
export const verifyOTP = asyncErrorHandler(async (req, res, next) => {

    const { otp, email } = req.body;
   //console.log("email",email);
    //nsole.log("otp",otp);

    try {
        // Fetch unverified user accounts matching the provided email
        const userAllEntries = await User.find({
            email
        });
         console.log("users",userAllEntries);


        // If no user entries are found
        if (!userAllEntries || userAllEntries.length === 0) {
            return next(new ErrorHandler("User not found", 400));
        }


        let user;
        if (userAllEntries.length > 1) {
            // If multiple entries are found, take the latest one
            user = userAllEntries[0];

            // Delete all other unverified entries for the same email
            const deleteResult = await User.deleteMany({
                _id: { $ne: user._id }, // Exclude the current user
                email,
                accountVerified: false,
            });
             console.log("Deleted duplicate unverified users:", deleteResult);
        } else {
            // If only one entry exists, take it
            user = userAllEntries[0];
        }
        console.log("user", user);

        // Validate the OTP
        
        if (user.verificationCode !== Number(otp)) {
            console.log("Invalid OTP. User's OTP:", user.verificationCode, "Provided OTP:", otp);
            return next(new ErrorHandler("Invalid OTP", 400));
        }

        // Check if the OTP has expired
        const currentTime = Date.now();
        const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();
         console.log("Current Time:", currentTime, "Code Expiry Time:", verificationCodeExpire);

        if (currentTime > verificationCodeExpire) {
            return next(new ErrorHandler("OTP Expired", 400));
        }

        // Update the user account as verified
        user.accountVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpire = null;

        // Save the user
        const savedUser = await user.save({ validateModifiedOnly: true });
        // console.log("User successfully verified:", savedUser);

        // Send a success response
        sendTokenAdmin(user, 200, "Account Verified", res)
        
        // const tokena = jwt.sign({ id: user._id }, process.env.JWT_REFRESHTSECRETA, {
        //         expiresIn: process.env.JWT_REFRESHTEXPIRESC,
        //     });
        //     user.token = tokena;
          
        //     res.status(200).cookie("tokena", tokena, {
        //         expires: new Date(Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        //         httpOnly: true,
        //         // secure:true
        //     }).json({
        //         success: true,
        //          user: {
        //             name: user.name,
        //             email: user.email,
        //             phone: user.phone,
        //         },
        //     })

    } catch (err) {
        // Log the error for debugging
        console.error("Error in verifyOTP:", err);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
});




// Register User
export const registerUser = asyncErrorHandler(async (req, res, next) => {
    const { name, email, password, phone, gender, role } = req.body;

    // Validate required fields
    if (!req.files || !req.files.avatar) return next(new ErrorHandler("Avatar is required!", 400));

    if (!name || !email || !password || !phone || !gender || !role ) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    const avatar = req.files.avatar;
    const allowedFormats = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(avatar.mimetype)) {
        return next(new ErrorHandler("Unsupported file format for avatar", 400));
    }

    if (role !== "Admin") {
        return next(new ErrorHandler("Invalid role", 400));
    }

    if (!validatePhoneNumber(phone)) {
        return next(new ErrorHandler("Invalid phone number format", 400));
    }

    //Check for existing users
    const existingUser = await User.findOne({
        email
    });
    if (existingUser) {
        return next(new ErrorHandler("User already exists", 400));
    }



    // Upload avatar to Cloudinary
    let cloudinaryResponse;
    try {
        cloudinaryResponse = await cloudinary.uploader.upload(avatar.tempFilePath);
    } catch (error) {
        console.error("Cloudinary Error:", error);
        return next(new ErrorHandler("Failed to upload avatar to Cloudinary", 500));
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateRandomFiveDigitNumber();
    const verificationCodeExpire = Date.now() + 5 * 60 * 1000; // 5 minutes

    const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        role,
        avatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        verificationCode,
        verificationCodeExpire,
    });

    // const tokena = jwt.sign({ id: user._id }, process.env.JWT_REFRESHTSECRETA, {
    //     expiresIn: process.env.JWT_REFRESHTEXPIRESA,
    // });
    // user.token = tokena;

    await user.save();

    // Send verification code
    sendVerificationCode(email,verificationCode, res);

    // Respond with success
    // res.status(200)
    //     .cookie("tokena", tokena, {
    //         expiresIn: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000),
    //         httpOnly: true,
    //         secure: true,
    //         //sameSite: "Strict",
    //     })
    //     .json({
    //         success: true,
    //         message: "User successfully registered",
    //         user: {
    //             name: user.name,
    //             email: user.email,
    //             phone: user.phone,
    //         },
    //     });
});






export const loginUser = asyncErrorHandler(async (req, res, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return next(new ErrorHandler("Please Enter the details", 400));
    }
    if (role !== "Admin") {
        return next(new ErrorHandler("Role is incorrect", 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorHandler("Email not registered", 400));
    }
    const isPasswordCorrect = bcrypt.compareSync(password, user.password)

    if (!isPasswordCorrect) {
        return next(new ErrorHandler("Password is incorrect", 400));
    }

    sendTokenAdmin(user, 200, "User login successfully", res)

    // const tokena = jwt.sign(
    //     { id: user._id },
    //     process.env.JWT_REFRESHTSECRETA,
    //     { expiresIn: process.env.JWT_REFRESHTEXPIRESA }
    // );

    // const userResponse = {
    //     email: user.email,
    //     name: user.name,
    //     phone: user.phone
    // }

    // user.token = tokena;
    // res
    //     .status(200)
    //     .cookie("tokena", tokena, {
    //         expiresIn: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000),
    //         httpOnly: true,
    //         //secure: true,
    //         //sameSite: "Strict"
    //     })
    //     .json({
    //         success: true,
    //         message: "User successfully login",
    //         userResponse
    //     });
});


// logout User
export const logOutUser = asyncErrorHandler(async (req, res, next) => {
    res
        .status(200)
        .cookie("tokena", "", {
            expiresIn: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        .json({
            success: true,
            message: "Logout Successfully"
        });
});




// forgot Password
export const forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email, accountVerified: true, });

    if (!user) {
        return next(new ErrorHandler("Email not registered", 404));
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/resetAdmin/${resetToken}`;

    const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`

    try {
        sendEmail({
            email: user.email,
            subject: "App Reset Password",
            message
        });
        res.status(200).json({
            success: true,
            message: "Email Sent Successfully"
        })
    }
    catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Cannot send reset password token.", 500))
    }

});



// reset Password
export const resetPassword = asyncErrorHandler(async (req, res, next) => {
    const { token } = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }, // greater than current date
    });
    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has been expired.", 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const userResponse = {
        email: user.email,
        name: user.name,
        phone: user.phone
    }

    const tokena = jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_REFRESHTSECRETA,
        {
            expiresIn: process.env.JWT_REFRESHTEXPIRESA,
        }
    );
    res.status(statusCode).cookie("tokena", tokena, {
        expiresIn: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        //secure:true,
        //sameSite: "Strict"
    }).json({
        success: true,
        message,
        userResponse,
    })
});




// getUsers
export const getUsers = asyncErrorHandler(async (req, res, next) => {
    const user = await User.find({ role: "Admin" });
    if (!user) {
        return next(new ErrorHandler("No Users exist", 400));
    }
    const userResponse = {
        email: user.email,
        name: user.name,
        phone: user.phone
    }
    res
        .status(200)
        .json({ message: "users", success: true, userResponse });
})



// deleteProfile
export const deleteProfile = asyncErrorHandler(async (req, res, next) => {
    const user = req.user;
    const userId = user._id;

    const userExist = await User.findById({ userId });
    if (!userExist) {
        return next(new ErrorHandler("User Profile not exist", 400));
    }

    await userExist.deleteOne();
    res
        .status(200)
        .json({ message: "User deleted", success: true })
});



// User Profile
export const userProfile = asyncErrorHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not exist", 400));
    }


    res
        .status(200)
        .json({
            success: true,
            user,
            message: "User Profile"
        })
})


// Update User Details->
export const updateUserDetails = asyncErrorHandler(async (req, res, next) => {

  const userId = req.user._id;

  const {
    name,
    phone,
    email,
    gender
  } = req.body;

  const findUser = User.findById(userId);
  if (!findUser) {
    return next(new ErrorHandler("Cannot find User", 400));
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      name,
      phone,
      email,
      gender
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );


  const userResponse = {
    email: user.email,
    name: user.name,
    phone: user.phone,
    gender: user.gender,
  }
  res
    .status(200)
    .json({ message: "User Details Updated", success: true, userResponse });
});


export const updateUserPassword = asyncErrorHandler(async (req, res, next) => {

  const user = req.user;
  const userId = user._id;

  const {
    oldPassword,
    newPassword
  } = req.body;

  const findUser = User.findById(userId);
  if (!findUser) {
    return next(new ErrorHandler("Cannot find User", 400));
  }
  const isPasswordCorrect = bcrypt.compareSync(oldPassword, user.password)
  if (!isPasswordCorrect) {
    return next(new ErrorHandler("Password do not match"));
  }

  const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
  const userUpdated = await User.findByIdAndUpdate(
    userId,
    {
      password: hashedNewPassword
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );

  res
    .status(200)
    .json({ message: "User Password Updated", success: true, userUpdated });
});

