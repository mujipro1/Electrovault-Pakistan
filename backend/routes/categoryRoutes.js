const express = require('express');
const { 
    getCategories, 
    getSingleCategoryData, 
    editCategoryName, 
    addNewCategory,
    getProducts,
    deleteCategory
} = require('../controllers/CategoryController');

const router = express.Router();

router.get('/', getCategories);
router.get('/single/:id', getSingleCategoryData);
router.get('/getProducts', getProducts);
router.post('/edit', editCategoryName);
router.post('/add', addNewCategory);
router.delete('/:id', deleteCategory);
   

module.exports = router;
