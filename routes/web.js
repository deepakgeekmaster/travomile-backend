const express = require('express');
const { sendReffer} = require('../controller/authController');

const router = express.Router();

router.post('/send-reffer', sendReffer);

module.exports = router;
