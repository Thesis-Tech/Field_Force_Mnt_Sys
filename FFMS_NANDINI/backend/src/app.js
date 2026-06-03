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

/**
 * ==========================================
 * Express Application Configuration
 * ==========================================
 * This file serves as the main entry point for configuring the Express app instance.
 * It defines the middleware pipeline, security headers, routing structure, and error handling.
 * 
 * Middleware Pipeline Order:
 * 1. Security (Helmet, CORS)
 * 2. Logging (Morgan)
 * 3. Body Parsing (JSON, URL Encoded, Cookies)
 * 4. Custom Middlewares (Audit, Rate Limiting)
 * 5. Routing (Swagger, v1 API, Health Check)
 * 6. Error Handling (404 Fallback, Global Error Handler)
 */
const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
// Always-allowed production origins (Cloudflare Pages deployment)
const PRODUCTION_ORIGINS = [
  'https://field-force-mnt-sys.pages.dev',
];

// Read allowed origins from environment variable (comma-separated)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin);

// Add FRONTEND_URL if it exists and not already included
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Always include known production origins regardless of env vars
PRODUCTION_ORIGINS.forEach(origin => {
  if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
});

// Add local development origins only in non-production (Render sets NODE_ENV=production)
if (process.env.NODE_ENV !== 'production') {
  const localOrigins = [
    'http://localhost:3000',
    'http://localhost:5001',
    'http://127.0.0.1:5001',
    'http://192.168.1.6',
    'http://192.168.1.8:5001'
  ];
  localOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  });
}

// If no origins defined at all, fallback to localhost:3000 for safety
if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    const isLocalhostCom = origin && /https?:\/\/(localhost\.com)(:\d+)?$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || isLocalhostCom) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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