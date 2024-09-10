const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-token', authController.verifyToken); // برای اعتبارسنجی توکن
router.post('/refresh-token', authController.refreshToken); // برای دریافت توکن جدید

module.exports = router;