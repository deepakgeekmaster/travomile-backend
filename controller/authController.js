const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const refferDetails = require('../models/RefferDetail');
const OTP = require('../models/otpSchema');

const { SendMail,sendOtp,generateReferralCode,refferalmail } = require('../Helper/Helper'); 

require('dotenv').config();


const signup = async (req, res) => {
    try {
        const { password, email, reffer } = req.body; // Extract 'reffer' from req.body
        const deviceInfo = req.device;

        // Send email if the email is provided
        if (email) {
            await SendMail(email, res, req); 
        }

        let checkReffer = null; 
        if (reffer) {
            checkReffer = await refferDetails.findOne({ Code: reffer });
            if (!checkReffer) {
                return res.status(400).json({ message: 'Invalid referral code' }); // Handle invalid referral code
            }
        }

        // Create a new user
        const newUser = new User({
            password: password,
            email: email,
            RefferBy: checkReffer ? checkReffer.UserId : null,
            devices: [{ 
                devicename: deviceInfo.device,
                Os: deviceInfo.os,
                browser: deviceInfo.browser,
                lastLogin: new Date()
            }]
        });

        // Save the new user to the database
        await newUser.save();

        // Generate a new referral code
        const referralCode = generateReferralCode();
        const newReffer = new refferDetails({ Code: referralCode, UserId: newUser._id });
        await newReffer.save();

        // Generate a JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send a successful response with the token
        res.status(201).json({ message: 'User created successfully', token });

    } catch (error) {
        console.log('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error }); // Use 500 for server errors
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

       await SendMail(email, res, req); 
      res.status(201).json({ message: 'Email Sent succesfully' });

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


const VerifyOtp = async  (req,res) => {
try {
    const { identifier,otp } = req.body;
    const otpRecord = await OTP.findOne({ email:identifier}).exec(); 
     if (otpRecord) {
         if(otpRecord.otp==otp)
         {
            res.status(200).send('OTP verified successfully');
         }
        res.status(200).send('OTP is inccorect');
    } else {
            res.status(400).send('Invalid OTP');
     }
  } 
catch (error) {
        console.error('Server error:', error);
    }
};



module.exports = { signup, login,sendReffer,EmailOtp,SmsOtp,VerifyOtp};
