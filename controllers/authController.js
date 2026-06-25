const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
exports.register = async (req, res) => {
  try {
    const { phoneNumber, pin, fullName, email } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ phoneNumber }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
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
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// @desc    Login user
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
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Get current user
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
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
};

// @desc    Verify OTP (simplified for now)
exports.verifyOTP = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

// @desc    Resend OTP (simplified for now)
exports.resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};