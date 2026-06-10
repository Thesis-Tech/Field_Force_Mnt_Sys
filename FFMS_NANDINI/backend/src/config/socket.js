const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('./jwt');
const prisma = require('./prisma');
const logger = require('./logger');
const { isOriginAllowed } = require('./cors'); // ← shared CORS logic

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      // Uses the exact same origin validator as Express CORS in app.js.
      // Any origin allowed there is allowed here — no duplication, no drift.
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Socket.IO CORS blocked origin: ${origin}`);
          callback(new Error('Socket: Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
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
