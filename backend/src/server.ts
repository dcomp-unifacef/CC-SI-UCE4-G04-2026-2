import 'dotenv/config';
import app from './app';
import { connectDB, disconnectDB } from './db/prisma';

const PORT = process.env.PORT || 3000;

await connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}...`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
  } else if (error.code === 'EACCES') {
    console.error(`Port ${PORT} requires elevated privileges!`);
  } else {
    console.error('Failed to initialize the server:', error);
  }
});

process.on('unhandledRejection', async (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await disconnectDB();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
