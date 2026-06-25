const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pin: {
    type: String,
    required: true,
    select: false
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

userSchema.methods.comparePIN = async function(candidatePIN) {
  return candidatePIN === this.pin;
};

userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    phoneNumber: this.phoneNumber,
    fullName: this.fullName,
    email: this.email,
    isVerified: this.isVerified,
    balance: this.balance
  };
};

module.exports = mongoose.model('User', userSchema);