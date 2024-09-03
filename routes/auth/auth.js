const express = require('express');
const { signup, login,EmailOtp,SmsOtp,VerifyOtp} = require('../../controller/authController');
const auth = require('../../middleware/authMiddleware');
const validateSignup = require('../../middleware/validateSignup');

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', login);
router.post('/verify-otp',VerifyOtp);

router.get('/protected', auth, (req, res) => {
    res.status(200).json({ message: 'This is a protected route' });
});

router.post('/sendotp',EmailOtp);
  
router.post('/smsotp',SmsOtp);
module.exports = router;
