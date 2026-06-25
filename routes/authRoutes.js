const express = require('express');
const router = express.Router();

// Simple test route first
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes working!' });
});

// Login route
router.post('/login', (req, res) => {
  const { phoneNumber, pin } = req.body;
  
  // Simple validation
  if (!phoneNumber || !pin) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and PIN are required'
    });
  }

  // For testing - accept any credentials
  res.json({
    success: true,
    message: 'Login successful. Waiting for admin approval.',
    user: {
      phoneNumber: phoneNumber,
      fullName: 'Test User'
    }
  });
});

// Register route
router.post('/register', (req, res) => {
  const { phoneNumber, pin, fullName, email } = req.body;
  
  if (!phoneNumber || !pin || !fullName || !email) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  res.json({
    success: true,
    message: 'Registration successful',
    user: {
      phoneNumber,
      fullName,
      email
    }
  });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  if (!phoneNumber || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Phone number and OTP are required'
    });
  }

  // Accept any 6-digit OTP
  if (otp.length === 6) {
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  }
});

// Resend OTP
router.post('/resend-otp', (req, res) => {
  res.json({
    success: true,
    message: 'OTP resent successfully'
  });
});

module.exports = router;