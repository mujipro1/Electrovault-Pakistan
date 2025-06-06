const express = require('express');
const { getShopData, addNewShop, getAllShops, approveShopRequest } = require('../controllers/ShopController');

const router = express.Router();

router.get('/getShop/:id', getShopData);
router.post('/addNew', addNewShop);
router.get('/all', getAllShops);
router.post('/approveShop', approveShopRequest);

module.exports = router;
