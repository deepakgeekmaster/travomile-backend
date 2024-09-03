const express = require('express');
const { GenderEdit,ContactEdit,PassportEdit,Panverification,uploadImage,uploader } = require('../../controller/profileController');

const router = express.Router();

router.put('/edit-gender', GenderEdit);

router.patch('/edit-contact', ContactEdit);

router.put('/edit-passport', PassportEdit);

router.post('/pan-verification', Panverification);

router.post('/upload-image', uploader.single('avtaar'), uploadImage);

module.exports = router;
