import express from 'express';
import limiter from 'express-rate-limit';
import { deleteProfile, forgotPassword, getUsers, loginUser, logOutUser, registerUser, resetPassword, updateUserDetails, updateUserPassword, userProfile, verifyOTP } from '../controllers/admin.controllers.js';
import { isAuthenticated } from '../utils/auth.js';


const router = express.Router();

const registerLimiter = limiter({
    max: 100,
    windowMs: 20*60*1000, // 20min
    message: 'We have received too many registeration requests from this Address. Please try after 30 min.'
})
const loginLimiter = limiter({
    max: 100,
    windowMs: 30 * 60 * 1000, // 30min
    message: 'We have received too many login requests from this Address. Please try after 30 min.'
})

router.post('/registerAdmin', registerLimiter, registerUser);
router.post('/otpAdmin',verifyOTP)
router.post('/loginAdmin',loginLimiter, loginUser);
router.get('/logoutAdmin',isAuthenticated, logOutUser);
router.post('/password/forgotAdmin', forgotPassword);
router.put('/password/resetAdmin/:token', resetPassword);

router.delete('/userDeleteAdmin', isAuthenticated, deleteProfile);
router.get('/userProfileAdmin', isAuthenticated, userProfile);
router.get('/getAdminsAdmin', getUsers);

router.put('/updateUserDetailsAdmin', isAuthenticated, updateUserDetails);
router.put('/updateUserPasswordAdmin', isAuthenticated, updateUserPassword);


export default router;