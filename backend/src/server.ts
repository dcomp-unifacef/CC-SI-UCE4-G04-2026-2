import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3000;

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
