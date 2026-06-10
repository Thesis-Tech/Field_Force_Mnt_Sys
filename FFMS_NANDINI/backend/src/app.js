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

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS Origin List ────────────────────────────────────────────────────────
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
    'http://192.168.1.8:5001',
  ];
  localOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  });
}

if (allowedOrigins.length === 0) {
  allowedOrigins.push('http://localhost:3000');
}

// ─── Origin Validator (shared with socket.js via export) ─────────────────────
/**
 * Returns true if the given origin is allowed.
 * Centralised here so Express CORS and Socket.IO CORS use identical logic.
 *
 * Allowed patterns:
 *  1. No origin (server-to-server / curl)
 *  2. Exact match in allowedOrigins list
 *  3. localhost.com variants          e.g. http://localhost.com:3000
 *  4. Cloudflare Pages previews       e.g. https://abc123.field-force-mnt-sys.pages.dev
 *  5. Vercel canonical preview        e.g. https://field-force-mnt-abc.vercel.app
 *  6. Vercel project-scoped previews  e.g. https://field-force-mnt-sys-rahul-kumar0012223552s-projects.vercel.app
 *  7. Vercel git-branch previews      e.g. https://field-force-mnt-sys-git-temp-rahul-kumar0012223552s-projects.vercel.app
 */
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  // localhost.com (dev convenience)
  if (/https?:\/\/(localhost\.com)(:\d+)?$/.test(origin)) return true;

  // Cloudflare Pages preview deployments
  if (/https:\/\/[a-z0-9-]+\.field-force-mnt-sys\.pages\.dev$/.test(origin)) return true;

  // Vercel canonical preview  (field-force-mnt-<hash>.vercel.app)
  if (/https:\/\/field-force-mnt-[a-z0-9-]+\.vercel\.app$/.test(origin)) return true;

  // Vercel project-scoped preview  (*-rahul-kumar0012223552s-projects.vercel.app)
  if (/https:\/\/[a-z0-9-]+-rahul-kumar0012223552s-projects\.vercel\.app$/.test(origin)) return true;

  // Vercel git-branch preview  (field-force-mnt-sys-git-<branch>-*-projects.vercel.app)
  if (/https:\/\/field-force-mnt-sys-git-[a-z0-9-]+-rahul-kumar0012223552s-projects\.vercel\.app$/.test(origin)) return true;

  return false;
};

// ─── Express CORS ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(auditLogger);
app.use('/api/', apiLimiter);

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', v1Router);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = app;
module.exports.isOriginAllowed = isOriginAllowed; // used by config/socket.js
module.exports.allowedOrigins = allowedOrigins;   // used for debugging if needed
