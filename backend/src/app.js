const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

// Import configurations
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');

// Import middlewares
const errorHandler = require('./middleware/error.middleware');
const auditLogger = require('./middleware/audit.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

// Import routes
const v1Router = require('./routes/v1');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Request Logging (Morgan + Winston)
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Global Audit Logger helper setup
app.use(auditLogger);

// Global API Rate Limiter
app.use('/api/', apiLimiter);

// Swagger Documentation serving
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes mounting
app.use('/api/v1', v1Router);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// Global Error Handler middleware
app.use(errorHandler);

module.exports = app;
