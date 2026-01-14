FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema and migrations BEFORE npm install
# This is needed for prisma generate to work
COPY prisma ./prisma

# Install dependencies
# Use npm install in Docker to ensure lock file is properly synced
# In development, use: npm ci (requires lock file to be in sync)
RUN npm install

# Generate Prisma Client during build
# This prevents runtime generation which can cause delays
RUN npx prisma generate

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Run migrations and start the application
# This ensures database is up-to-date before app starts
CMD ["sh", "-c", "npx prisma migrate deploy --skip-generate && node server.js"]
