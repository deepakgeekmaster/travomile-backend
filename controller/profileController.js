const UserDetail = require('../models/UserDetail');
const mongoose = require('mongoose');
const User = require('../models/Users');
const { SendMail,sendOtp,ValidPassport } = require('../Helper/Helper'); 
const axios = require('axios');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploader = multer({ storage: storage });

const GenderEdit = async (req, res) => {
    try {
        const { gender, firstName, lastName, dateOfBirth, nationality, UserId } = req.body;

        if (!UserId) {
            return res.status(400).json({ message: 'UserId is required' });
        }

        const updateFields = {
            ...(gender && { gender }),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(nationality && { nationality }),
        };

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No update fields provided' });
        }

        const options = { new: true, upsert: true }; 
        const updatedUser = await UserDetail.findOneAndUpdate(
            { UserId },
            { $set: updateFields },
            options
        );

        const message = updatedUser.isNew ? 'User details created successfully' : 'User updated successfully';
        return res.status(updatedUser.isNew ? 201 : 200).json({ message, user: updatedUser });

    } catch (error) {
        console.error('Error updating or creating user:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

const ContactEdit = async (req, res) => {
    try {
        const { email, PhoneNumber,UserId } = req.body;

        if (!UserId) {
            return res.status(400).json({ message: 'UserId is required' });
        }
        let updateFields = {};
        if (email) { updateFields.email = email; await SendMail(email); }
        if (PhoneNumber) { updateFields.phone = PhoneNumber; await sendOtp(PhoneNumber); }

        console.log('Updating user with fields:', updateFields);

        const updatedUser = await User.findByIdAndUpdate(
            UserId,
            { $set: updateFields },
            { new: true } 
        );
        if (updatedUser) {
            return res.status(200).json({ message: 'User Contact Details Updated', updatedUser });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }

    } catch (error) {
        console.error('Error updating or creating user:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};



const uploadImage = async (req, res) => {
    try {

        const { UserId } = req.body;

        if (!UserId) {
            return res.status(400).json({ message: 'UserId is required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const updateFields = {
            avatar: req.file.filename 
        };

        const updatedUser = await UserDetail.findOneAndUpdate(
            { UserId },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User avatar updated', updatedUser });

    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};


const PassportEdit = async (req, res) => {
    try {
        const { PassportNumber, Expiry,Country,UserId } = req.body;

        if (!UserId) {
            return res.status(400).json({ message: 'UserId is required' });
        }

        const validpass = ValidPassport(PassportNumber);
        
        if(validpass == false){
            return res.status(500).json({ message: "not valid" });
        }

    
        const updateFields = {
            ...(PassportNumber && { PassportNumber }),
            ...(Expiry && { Expiry }),
            ...(Country && { Country }),
        };

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No update fields provided' });
        }

        const options = { new: true, upsert: true }; 
        const updatedUser = await UserDetail.findOneAndUpdate(
            { UserId },
            { $set: updateFields },
            options
        );

        const message = updatedUser.isNew ? 'User details created successfully' : 'User updated successfully';
        return res.status(updatedUser.isNew ? 201 : 200).json({ message, user: updatedUser });

    } catch (error) {
        console.error('Error updating or creating user:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};


const Panverification = async (req, res) => {
    try {
        const { fName, mName, lName, dob, panNo } = req.body;

        const clientId = 'a5e78be105afc3d6be41bdd6c7f90e2f:3d8de08e41caa34431562d2af19fb8a9'; 
        const secretKey = 'DY2p8U7lFTCrB8PIuELsQ3yJq5d5Xzr5TEM6V3bd7c4K4jRayZpTKn0AOaR3KDNhH';

        // Make the API request
        const response = await axios.post('https://api.invincibleocean.com/invincible/panPlus', 
            { panNumber: panNo }, 
            {
                headers: {
                    'clientId': clientId,
                    'secretKey': secretKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        const pandata = response.data.result;
        const checkfname = pandata.FIRST_NAME;
        const checkmname = pandata.MIDDLE_NAME;
        const checklname = pandata.LAST_NAME;
        const checkdob = pandata.DOB;

        // Validate the extracted data
        if (
            checkfname == fName &&
            checkmname == mName &&
            checklname == lName &&
            checkdob == dob
        ) {
            return res.status(200).json({ message: 'PAN details are valid', pandata });
        } else {
            return res.status(400).json({ message: 'PAN details do not match', pandata });
        }

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = { GenderEdit,ContactEdit,PassportEdit,Panverification,uploadImage, uploader };
