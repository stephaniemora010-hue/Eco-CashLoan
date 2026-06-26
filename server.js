const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

console.log('🚀 Eco-Cash Backend Starting...');

const app = express();

// ============================================
// CORS - FULLY ENABLED
// ============================================
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Handle preflight requests
app.options('*', cors());

// Additional CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }
  next();
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// SIMPLE TEST ROUTES
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'connected'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EcoCash API is running!',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// AUTH ROUTES
// ============================================
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: /api/health`);
});