/**
 * Finance Dashboard Backend
 * Main application entry point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/database');
const { globalErrorHandler, handleUncaughtException } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const financeRoutes = require('./routes/finances');
const dashboardRoutes = require('./routes/dashboard');

// Initialize express app
const app = express();

// Handle uncaught exceptions
handleUncaughtException();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/finances', financeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Finance Dashboard API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      finances: '/api/finances',
      dashboard: '/api/dashboard'
    }
  });
});

// Handle undefined routes (Express 5 compatible)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    data: null,
    error: 'Not Found'
  });
});

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  =========================================
    Finance Dashboard Backend Server
  =========================================
    Environment: ${process.env.NODE_ENV || 'development'}
    Port: ${PORT}
    API URL: http://localhost:${PORT}
  =========================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  
  // Gracefully close server
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
