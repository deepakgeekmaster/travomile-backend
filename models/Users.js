const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const deviceSchema = new mongoose.Schema({
    devicename: String,
    Os: String,
    browser: String,
    lastLogin: { type: Date, default: Date.now },
  });

const userSchema = new mongoose.Schema({
    username: { type: String},
    email: { type: String, unique: true, sparse: true }, 
    phone: { type: Number, unique: true, sparse: true }, 
    googleId: { type: String, unique: true, sparse: true },
    facebookid: { type: String, unique: true, sparse: true },
    password: { type: String },
    devices: [deviceSchema],
    RefferBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Users' 
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Users', userSchema);
