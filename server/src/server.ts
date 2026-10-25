import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { getStorageRepository } from './services/storage';
import { setupSocketHandlers } from './socket/socketHandler';
import { config } from './config/env';

async function bootstrap() {
  const storage = await getStorageRepository();
  const app = createApp(storage);
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  setupSocketHandlers(io, storage);

  httpServer.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   VERBALOOP REAL-TIME SERVER                  ║
║           "Different languages. One conversation."            ║
╠═══════════════════════════════════════════════════════════════╣
║  Port:                ${config.port}                                    ║
║  Environment:         ${config.nodeEnv}                              ║
║  Storage Mode:        ${storage.getStorageType()}                            ║
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
