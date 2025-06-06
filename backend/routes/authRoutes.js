const express = require('express');
const { login, addNewUser } = require('../controllers/AuthController');

const router = express.Router();

router.post('/login', login);
router.post('/addNewUser', addNewUser);

module.exports = router;
