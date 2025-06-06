const express = require('express');
const multer = require('multer');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {placeNewOrder,  getOrderById, markOrderAsDispatched } = require('../controllers/OrderController');

const router = express.Router();

router.get('/:id', getOrderById);
router.get('/markDispatched/:id', markOrderAsDispatched);
router.post('/newOrder', upload.single('paymentScreenshot'), placeNewOrder);

module.exports = router;
