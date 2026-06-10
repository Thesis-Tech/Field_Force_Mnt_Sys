const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('./jwt');
const prisma = require('./prisma');
const logger = require('./logger');
let io = null;

// CORS origin checker for Socket.IO
// Reads allowed origins from ALLOWED_ORIGINS env variable
// Never hardcode URLs here — add to .env instead
const _allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

const _checkOrigin = (origin, callback) => {
  // Allow requests with no origin (mobile apps, Postman, server-to-server)
  if (!origin) return callback(null, true);
  // Check exact match
  if (_allowedOrigins.includes(origin)) return callback(null, true);
  // Allow all Vercel preview deployments for this project
  if (origin.includes('vercel.app')) return callback(null, true);
  // Allow localhost for local development
  if (origin.includes('localhost')) return callback(null, true);
  // Block everything else
  return callback(new Error('CORS: origin not allowed — ' + origin));
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: _checkOrigin,
      credentials: true,
      methods: ['GET', 'POST']
    },
    // Prevent reconnect storms when the client drops (e.g. CORS error burst).
    // Client-side should also set reconnectionAttempts: 5.
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // ─── Authentication Middleware ──────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: Token is required'));
      }

      const decoded = jwt.verify(token, accessTokenSecret);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('Authentication error: User not active'));
      }

      // Attach user details to socket
      socket.user = {
        id: user.id,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      };

      next();
    } catch (err) {
      logger.error('Socket authentication failed:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // ─── Connection Handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { id, name, role, organizationId } = socket.user;

    logger.info(`Socket connected: ${name} (${role}) - Socket ID: ${socket.id}`);

    // Join direct user room
    socket.join(`user:${id}`);

    if (['ADMIN', 'MANAGER'].includes(role)) {
      socket.join(`org:${organizationId}:admins`);
      logger.info(`User ${name} joined org:${organizationId}:admins room`);
    } else if (role === 'FIELD_STAFF') {
      io.to(`org:${organizationId}:admins`).emit('staff:online', {
        userId: id,
        name,
        socketId: socket.id,
      });
      logger.info(`Field staff ${name} is online. Emitted staff:online to admins.`);
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${name} - Socket ID: ${socket.id}`);

      if (role === 'FIELD_STAFF') {
        io.to(`org:${organizationId}:admins`).emit('staff:offline', {
          userId: id,
          name,
        });
        logger.info(`Field staff ${name} went offline. Emitted staff:offline to admins.`);
      }
    });
  });

  return io;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

const emitToOrgAdmins = (organizationId, eventName, data) => {
  if (io) {
    io.to(`org:${organizationId}:admins`).emit(eventName, data);
  }
};

const emitToUser = (userId, eventName, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(eventName, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToOrgAdmins,
  emitToUser,
};
