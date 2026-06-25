const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\d{9}$/, 'Please enter a valid 9-digit phone number']
  },
  pin: {
    type: String,
    required: [true, 'PIN is required'],
    minlength: 4,
    maxlength: 4,
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash PIN before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare PIN method
userSchema.methods.comparePIN = async function(candidatePIN) {
  return await bcrypt.compare(candidatePIN, this.pin);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  if (!this.lockUntil) return false;
  return this.lockUntil > Date.now();
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    phoneNumber: this.phoneNumber,
    fullName: this.fullName,
    email: this.email,
    isVerified: this.isVerified,
    isActive: this.isActive,
    balance: this.balance,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);