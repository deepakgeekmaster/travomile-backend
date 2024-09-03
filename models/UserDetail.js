const mongoose = require('mongoose');

const userDetailSchema = new mongoose.Schema({
    gender: { 
        type: String, 
        enum: ['Male', 'Female'], 
        required: true
    },
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String,
        required: true 
    },
    UserId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true 
    },
    dateOfBirth: { 
        type: String,
        required: true
    },
    avatar: { 
        type: String
    },
    nationality: { 
        type: String,
        required: true
    },
    PassportNumber: { 
        type: String,
    },
    Expiry: { 
        type: String,
    },
    Country: { 
        type: String,
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('UserDetail', userDetailSchema);
