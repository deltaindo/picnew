FROM node:18-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Copy prisma schema (needed for prisma generate)
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Generate Prisma Client during build (faster than runtime)
RUN npx prisma generate

# Copy application code
COPY src ./src
COPY server.js .
COPY db.js .
COPY prisma-client.js .

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy --skip-generate && node server.js"]
