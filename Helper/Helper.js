

var postmark = require("postmark");
const twilio = require('twilio');
require('dotenv').config();
const { parsePhoneNumberFromString } = require('libphonenumber-js');

var client = new postmark.ServerClient("37f33254-983e-4c33-8927-59d8d531c5fb");

const SendMail = async (email,res) => {
    try {
        const otpStore = {};
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        await client.sendEmail({
            "From": "athar@geekmaster.io",
            "To": email,
            "Subject": "Hello from Postmark",
            "HtmlBody": `<strong>Hello</strong> dear Travomile user Your Otp Password ${otp}`,
            "TextBody": "Hello from Postmark!",
            "MessageStream": "travomile"
        });

        console.log(otp);
       
        res.send('OTP sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; 
    }
};


const refferalmail = async (email,code) => {
    try {
         client.sendEmail({
            "From": "deepak@geekmaster.io",
            "To": email,
            "Subject": "Hello from Postmark",
            "HtmlBody": `<strong>Hello</strong> dear Travomile user Your Refferal Code is ${code} or folllow this url ${process.env.Frontend_Url}?${code} `,
            "TextBody": "Hello from Postmark!",
            "MessageStream": "travomile"
        });
    } catch (error) {
        console.error('Error sending email:', error.message);
        console.error('Stack trace:', error.stack);
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        throw error; 
    }
};


const formatPhoneNumber = (phone) => {
    const cleanedPhone = phone.replace(/\D/g, '');
    
    const countryCode = '91';
    if (!cleanedPhone.startsWith(countryCode)) {
        cleanedPhone = countryCode + cleanedPhone;
    }

    return cleanedPhone.replace(/^(\d{2})(\d{5})(\d{5})$/, '+$1 $2 $3');
};

const sendOtp = async (phone, res, req) => {
    try {
        const accountSid = process.env.accountSid;
        const authToken = process.env.authToken;
        const client = twilio(accountSid, authToken);;
       
        if (!phone) {
            return res.status(400).json({ message: 'phoneNumber required' });
        }
        const formattedPhone = formatPhoneNumber(phone);
        console.log('Formatted Phone Number:', formattedPhone);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(otp);

          client.messages
          .create({
              body: `Your Otp Password ${otp}`,
              from: '+12565872816',
              to: formattedPhone
          })
        .then(message => {
            console.error('Otp Sent:');
        })
        res.cookie('otp', otp, { httpOnly: false, maxAge: 15 * 60 * 1000 }); 
        res.send('')
    } catch (error) {
        console.error('Server error:', error);
    }
};

const ValidPassport = async  (str,res) => {
    try {
        const pattern = /^[A-Z][1-9]\d\s?\d{4}[1-9]$/;

        return pattern.test(str);
        
    } catch (error) {
        console.error('Server error:', error);
    }
};





const generateReferralCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};

module.exports = { SendMail,sendOtp,ValidPassport,generateReferralCode,refferalmail };
