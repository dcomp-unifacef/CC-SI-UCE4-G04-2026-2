import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma: PrismaClient = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('DataBase connected via prisma');
  } catch (error) {
    console.error(
      'Database connection failed:',
      error instanceof Error ? error.name : 'UnknownError',
    );
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
  await pool.end();
};
