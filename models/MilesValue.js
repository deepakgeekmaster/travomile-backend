const mongoose = require('mongoose');

const MilesValue = new mongoose.Schema({
    Origin: { 
        type: String, 
    },
    PerctangeAbso: { 
        type: String, 
        required: true
    },
    Value:{
        type: Number, 
        required: true
    },
}, {
    timestamps: true 
});

module.exports = mongoose.model('milesValue', MilesValue);
