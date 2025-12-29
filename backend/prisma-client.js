const { PrismaClient } = require('@prisma/client');

console.log('\n✅ [Prisma Client] Initializing...');

// Create a single instance to avoid connection pool exhaustion
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Test connection immediately on module load
prima.$connect()
  .then(() => {
    console.log('✅ [Prisma] Successfully connected to database');
  })
  .catch((err) => {
    console.error('❌ [Prisma] Failed to connect:', err.message);
    process.exit(1);
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

console.log('[Prisma Client] Module ready for export');

module.exports = prisma;
