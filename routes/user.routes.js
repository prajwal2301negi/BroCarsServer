import express from 'express';
import limiter from 'express-rate-limit';
import { deleteProfile, forgotPassword, getUsers, loginUser, logOutUser, registerUser, resetPassword, updateUserDetails, updateUserPassword, userProfile, verifyOTP } from '../controllers/user.controllers.js';
import { isAuthenticated, isUserAuthenticated } from '../utils/auth.js';


const router = express.Router();

const registerLimiter = limiter({
    max: 50,
    windowMs: 20*60*1000, // 20min
    message: 'We have received too many registeration requests from this Address. Please try after 30 min.'
})
const loginLimiter = limiter({
    max: 50,
    windowMs: 30 * 60 * 1000, // 30min
    message: 'We have received too many login requests from this Address. Please try after 30 min.'
})

router.post('/register', registerLimiter, registerUser);
router.post('/otp',verifyOTP)
router.post('/login',loginLimiter, loginUser);
router.get('/logout',isUserAuthenticated, logOutUser);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);

router.delete('/userDelete', isUserAuthenticated, deleteProfile);
router.get('/userProfile', isUserAuthenticated, userProfile);
router.get('/getUsers', getUsers);

router.put('/updateDetails', isUserAuthenticated, updateUserDetails);
router.put('/updatePassword', isUserAuthenticated, updateUserPassword);


export default router;
