require('dotenv').config(); // VERY FIRST LINE

console.log("✅ MongoDB URI:", process.env.MONGODB_URI); // Debugging


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: '*'
}));
app.use(bodyParser.json({
  limit: '50mb' // Increase limit for larger payloads
}));

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB Atlas...');
    console.log('Database:', new URL(mongoURI).pathname.split('/')[1]);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close socket after 45 seconds of inactivity
      family: 4 // Use IPv4, as IPv6 can cause issues
    });
    
    console.log('MongoDB Atlas connected successfully');
    console.log('MongoDB Version:', mongoose.version);
    
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error.message);
    console.log('\nTo fix this issue:');
    console.log('1. Verify your MongoDB Atlas connection string in .env file');
    console.log('2. Ensure your IP address is whitelisted in MongoDB Atlas');
    console.log('3. Check network connectivity to MongoDB Atlas');
    console.log('\nServer will start without database connection...');
  }
};

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'HealthifyMe API is running',
    endpoints: {
      users: '/api/users',
      health: '/health',
      bmi: {
        analysis: '/api/users/bmi-analysis',
        history: '/api/users/bmi-history',
        calculate: '/api/users/calculate-bmi'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HealthifyMe API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'API base endpoint. See /api/users or /health for available endpoints.'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);