const validateSignup = (req, res, next) => {
    const {password, email, phone } = req.body;


    console.log(password,"password")

    if (!password) {
        return res.status(400).json({ message: 'password are required.' });
    }

    if (!email && !phone) {
        return res.status(400).json({ message: 'At least one of email or phone is required.' });
    }

    next();
};

module.exports = validateSignup;
