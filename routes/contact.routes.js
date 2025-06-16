import express from 'express';
import { saveMessages, getMessages } from '../controllers/contact.controllers.js';
import { isAuthenticated } from '../utils/auth.js';


const router = express.Router();


router.post('/sendMessage', saveMessages);






router.get("/getMessages",   getMessages);



export default router;