const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/error.middleware');
const auditLogger = require('./middleware/audit.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const v1Router = require('./routes/v1');

const app = express();
app.use(helmet());

const PRODUCTION_ORIGINS = [
  'https://field-force-mnt-sys.pages.dev',
  'https://field-force-mnt-sys.vercel.app',
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin);

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

PRODUCTION_ORIGINS.forEach(origin => {
  if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
});

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

if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000');
}

app.use(cors({
  origin: (origin, callback) => {
    const isLocalhostCom = origin && /https?:\/\/(localhost\.com)(:\d+)?$/.test(origin);
    const isCloudflarePagesPreview = origin && /https:\/\/[a-z0-9-]+\.field-force-mnt-sys\.pages\.dev$/.test(origin);
    const isVercelPreview = origin && /https:\/\/field-force-mnt-[a-z0-9-]+\.vercel\.app$/.test(origin);
    const isVercelProject = origin && /https:\/\/[a-z0-9-]+-rahul-kumar0012223552s-projects\.vercel\.app$/.test(origin);

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      isLocalhostCom ||
      isCloudflarePagesPreview ||
      isVercelPreview ||
      isVercelProject
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(auditLogger);
app.use('/api/', apiLimiter);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use('/api/v1', v1Router);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});
app.use(errorHandler);
module.exports = app;
