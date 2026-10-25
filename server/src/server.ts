import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createApp } from './app';
import { getStorageRepository } from './services/storage';
import { setupSocketHandlers } from './socket/socketHandler';
import { redisService } from './services/redis/redisClient';
import { trafficController } from './services/traffic/trafficController';
import { config, isOriginAllowed } from './config/env';

async function bootstrap() {
  const storage = await getStorageRepository();
  const app = createApp(storage);
  const httpServer = http.createServer(app);

  // Gracefully handle EADDRINUSE if port is already occupied
  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`
❌ [Server Error] Port ${config.port} is already in use by another running process.
💡 Solution:
   1. Stop the existing process running on port ${config.port}.
   2. To free port ${config.port} on Windows PowerShell:
      Get-Process -Id (Get-NetTCPConnection -LocalPort ${config.port} -ErrorAction SilentlyContinue).OwningProcess | Stop-Process -Force
   3. Or specify a different port in server/.env (e.g. PORT=5001).
      `);
      process.exit(1);
    } else {
      console.error('❌ [Server Error]', err);
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked for origin: ${origin}`), false);
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  // Initialize Redis for distributed traffic control and horizontal scaling if configured
  const hasRedis = await redisService.init();
  if (hasRedis) {
    const { pubClient, subClient } = redisService.getPubSubClients();
    if (pubClient && subClient) {
      io.adapter(createAdapter(pubClient, subClient));
      console.log('⚡ [Socket.IO] Redis Adapter initialized for horizontal cluster scaling');
    }
  }

  setupSocketHandlers(io, storage);

  httpServer.listen(config.port, () => {
    const trafficMode = redisService.isReady()
      ? 'redis (distributed)'
      : 'in-memory (local)';

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   VERBALOOP REAL-TIME SERVER                  ║
║           "Different languages. One conversation."            ║
╠═══════════════════════════════════════════════════════════════╣
║  Port:                ${config.port}                                    ║
║  Environment:         ${config.nodeEnv}                              ║
║  Storage Mode:        ${storage.getStorageType()}                            ║
║  Traffic Controller:  ${trafficMode.padEnd(20)}        ║
║  AI Provider:         ${config.translationProvider}                                ║
║  CORS Origin:         ${config.corsOrigin}                       ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });

  return { app, httpServer, io };
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    process.exit(1);
  });
}

export { bootstrap };

