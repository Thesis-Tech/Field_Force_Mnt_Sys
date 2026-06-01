require('dotenv').config();
// Start background job workers
require('./jobs/geofenceAlert.job')
const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const prisma = require('./config/prisma');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Bind Socket.IO
initSocket(server);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Swagger API Docs available at http://localhost:${PORT}/api/v1/docs`);
});

// Unhandled Promise Rejections handler
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});

// Uncaught Exceptions handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});

// Trigger nodemon restart
