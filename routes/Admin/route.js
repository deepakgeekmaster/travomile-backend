const express = require('express');
const router = express.Router();

const { MilesValue } = require('../../controller/Admin/Miles')

router.post('/add-miles-percentage' ,MilesValue);

module.exports = router;
