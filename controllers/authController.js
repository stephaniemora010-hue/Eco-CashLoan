const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { phoneNumber, pin, fullName, email } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ phoneNumber }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone or email'
      });
    }

    const user = await User.create({
      phoneNumber,
      pin,
      fullName,
      email
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;

    const user = await User.findOne({ phoneNumber }).select('+pin');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePIN(pin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    // For demo: accept any 6-digit OTP
    if (otp && otp.length === 6) {
      const user = await User.findOne({ phoneNumber });
      if (user) {
        user.isVerified = true;
        await user.save();
        
        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          message: 'OTP verified successfully',
          token,
          user: user.getPublicProfile()
        });
      }
    }
    
    res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};