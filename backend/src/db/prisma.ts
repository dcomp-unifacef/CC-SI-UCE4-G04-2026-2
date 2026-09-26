import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma: PrismaClient = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('DataBase connected via prisma');
  } catch (e) {
    console.log('Database connection error:', e);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
  await pool.end();
};
