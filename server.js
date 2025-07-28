require('dotenv').config(); // VERY FIRST LINE

console.log("✅ MongoDB URI:", process.env.MONGODB_URI); // Debugging

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '50mb' }));

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI is not defined in .env file');

    console.log('Connecting to MongoDB Atlas...');
    console.log('Database:', new URL(mongoURI).pathname.split('/')[1]);

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log('✅ MongoDB Atlas connected successfully');
    console.log('📦 MongoDB Version:', mongoose.version);

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\nTo fix:');
    console.log('1. Check MONGODB_URI in .env');
    console.log('2. Whitelist your IP in MongoDB Atlas');
    console.log('3. Check network connectivity\n');
  }
};

// Routes
app.use('/api/users', userRoutes);

// ✅ Add Ping Route
app.get('/api/auth/ping', (req, res) => {
  res.status(200).json({ success: true, message: 'Ping successful. Backend is live!' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Root routes
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
        calculate: '/api/users/calculate-bmi',
      },
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'HealthifyMe API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'success',
    message: 'API base endpoint. See /api/users or /health for available endpoints.',
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  });
};

startServer().catch(console.error);
