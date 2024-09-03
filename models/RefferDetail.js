const mongoose = require('mongoose');

const refferDetailsSchema = new mongoose.Schema({
    Code: { 
        type: String, 
        required: true
    },
    UserId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users', 
        required: true 
    },
    Refreeid: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
    }],
}, {
    timestamps: true 
});

module.exports = mongoose.model('refferDetails', refferDetailsSchema);
