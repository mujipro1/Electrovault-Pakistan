const express = require('express');
const { 
    getAllSellers,
    getCompleteSellerData,
    getSellerFromShopId,
    getSellerShops,
    editProduct,
    getBalanceBySellerId

} = require('../controllers/SellerController');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// Middleware to handle indexed array fields
const uploadIndexedArray = (req, res, next) => {
  upload.any()(req, res, function(err) {
    if (err) return next(err);
    
    // Group files by their base field name
    const files = {};
    req.files.forEach(file => {
      const match = file.fieldname.match(/^(.+?)(\[\d+\])?$/);
      const baseName = match[1];
      if (!files[baseName]) files[baseName] = [];
      files[baseName].push(file);
    });
    
    req.filesGrouped = files;
    next();
  });
};

const router = express.Router();

router.get('/all', getAllSellers);
router.get('/complete/:id', getCompleteSellerData);
router.get('/getSellerFromShopId/:id', getSellerFromShopId);
router.get('/getSellerShops/:id', getSellerShops);
router.get('/getBalanceBySellerId/:id', getBalanceBySellerId);
router.post('/editProduct/:id',uploadIndexedArray, editProduct);


module.exports = router;
