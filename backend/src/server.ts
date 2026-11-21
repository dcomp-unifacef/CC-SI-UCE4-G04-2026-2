import 'dotenv/config';
import app from './app';
import { connectDB, disconnectDB } from './db/prisma';

const port = Number(process.env.PORT ?? 3000);

await connectDB();

const server = app.listen(port, () => {
  console.log(`Sono Inteligente API listening on port ${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('Failed to start the API server:', error.message);
  process.exitCode = 1;
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down API`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
