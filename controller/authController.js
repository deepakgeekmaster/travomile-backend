const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const refferDetails = require('../models/RefferDetail');
const { SendMail,sendOtp,generateReferralCode,refferalmail } = require('../Helper/Helper'); 

require('dotenv').config();


const signup = async (req, res) => {
    try {
        const {username,password, email, phone,reffer } = req.body;
        const deviceInfo = req.device;
        if (email) {
            await SendMail(email, res); 
            return;
        }
        if (phone) await sendOtp(phone);
        let checkReffer = null; 
        if (reffer) {
            checkReffer = await refferDetails.findOne({ Code: reffer });
            if (!checkReffer) {
                return;
              
            }
        }
  
        const newUser = new User({ username: username, password, email, phone, RefferBy: checkReffer ? checkReffer.UserId : null, devices: [{ devicename: deviceInfo.device,Os:deviceInfo.os,browser:deviceInfo.browser, lastLogin: new Date() }], });
        await newUser.save();
        const referralCode = generateReferralCode();

        const newreffer = new refferDetails({ Code: referralCode, UserId:newUser._id});
        await newreffer.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    } catch (error) {
        console.log('Error creating user:', error);
        res.status(400).json({ message: 'Error creating user', error });
    }
};

const login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        const user = await User.findOne({ $or: [{ email }, { phone }] });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message:"user logged in succesfully",token });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const sendReffer = async (req, res) => {
    try {
        const { UserId, email } = req.body; 
        if (!UserId || !email) {
            return res.status(400).json({ message: 'UserId and email are required' });
        }

        const checkReffer = await refferDetails.findOne({ UserId });
        if (!checkReffer) {
            return res.status(404).json({ message: 'Referral details not found' });
        }

        await refferalmail(email, checkReffer.Code);
        res.status(201).json({ message: 'Code sent successfully' });
    } catch (error) {
        console.error('Error sending referral code:', error);
        res.status(400).json({ message: 'Error sending referral code', error });
    }
};


const EmailOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        await SendMail(email,res);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const SmsOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        await sendOtp(phone, res, req);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const VerifyOtp = async  (str,res) => {
    try {
       const { email, phone, otp } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone number is required' });
        }
            if (!otp) {
                return res.status(400).json({ message: 'OTP is required' });
            }

         const storeKey = email || phone;
        const storedOtp = otpStore[storeKey];

        if (!storedOtp) {
            return res.status(400).json({ message: 'OTP not found' });
        }

        if (Date.now() > storedOtp.expiresAt) {
            delete otpStore[storeKey];
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (storedOtp.otp == otp) {
            delete otpStore[storeKey];
            res.json({ message: 'OTP verified successfully!' });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }

        
    } catch (error) {
        console.error('Server error:', error);
    }
};



module.exports = { signup, login,sendReffer,EmailOtp,SmsOtp,VerifyOtp};
