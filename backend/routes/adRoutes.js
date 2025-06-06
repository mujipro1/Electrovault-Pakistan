const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory for processing

const { getAllAds, updateAds } = require('../controllers/AdController');

const router = express.Router();

router.get('/getAllAds', getAllAds);
router.post('/updateAd', upload.single('image'), updateAds);

module.exports = router;
