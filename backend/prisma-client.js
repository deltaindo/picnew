const { PrismaClient } = require('@prisma/client');

// Create a single instance to avoid connection pool exhaustion
const prisma = new PrismaClient();

// Log when connected
prisma.$connect()
  .then(() => {
    console.log('✅ [Prisma] Connected to database');
  })
  .catch((err) => {
    console.error('❌ [Prisma] Connection failed:', err.message);
  });

// Graceful disconnect on process termination
process.on('SIGTERM', async () => {
  console.log('[Prisma] SIGTERM received, disconnecting...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Prisma] SIGINT received, disconnecting...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
