const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const authController = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('phoneNumber')
    .isLength({ min: 9, max: 9 })
    .withMessage('Phone number must be 9 digits')
    .matches(/^\d{9}$/)
    .withMessage('Phone number must contain only digits'),
  body('pin')
    .isLength({ min: 4, max: 4 })
    .withMessage('PIN must be exactly 4 digits')
    .matches(/^\d{4}$/)
    .withMessage('PIN must contain only digits'),
  body('fullName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
];

const loginValidation = [
  body('phoneNumber')
    .isLength({ min: 9, max: 9 })
    .withMessage('Phone number must be 9 digits')
    .matches(/^\d{9}$/)
    .withMessage('Phone number must contain only digits'),
  body('pin')
    .isLength({ min: 4, max: 4 })
    .withMessage('PIN must be exactly 4 digits')
    .matches(/^\d{4}$/)
    .withMessage('PIN must contain only digits')
];

// ============================================
// ROUTES
// ============================================

// Public routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.post('/verify-otp', authController.verifyOTP);   // ✅ FIXED
router.post('/resend-otp', authController.resendOTP);   // ✅ FIXED

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;