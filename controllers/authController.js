// Simple auth controller
exports.register = async (req, res) => {
  try {
    const { phoneNumber, pin, fullName, email } = req.body;
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { phoneNumber, fullName, email }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: { phoneNumber }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: '123',
      fullName: 'Test User',
      phoneNumber: '771234567'
    }
  });
};

exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  if (otp && otp.length === 6) {
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
};

exports.resendOTP = async (req, res) => {
  res.json({
    success: true,
    message: 'OTP resent successfully'
  });
};