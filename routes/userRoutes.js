// routes/authRoutes.js

const express = require('express');
const router = express.Router();

const {
    register,
    forgotPassword,
    resetPassword,
    login
} = require('../controllers/userCtrl');

router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/login', login);

module.exports = router;