const express = require('express');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { getProducts, getProductById, handleSearchQuery, getRecommendedProducts, addNewProduct, addReview, fetchProductNames } = require('../controllers/ProductController');

const router = express.Router();

router.get('/', getProducts);
router.get('/getProductById/:id', getProductById);
router.get('/fetchProductNames', fetchProductNames);
router.post('/addNew', upload.array('images'), addNewProduct);
router.post('/addReview/:id', addReview);
router.post('/searchQuery', handleSearchQuery);
router.get('/recommended-products/:userId', getRecommendedProducts); 

module.exports = router;
