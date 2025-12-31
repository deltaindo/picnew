# Use Debian-based Node image for better Prisma compatibility
FROM node:18-slim

WORKDIR /app

# Install OpenSSL, PostgreSQL client, and other dependencies
RUN apt-get update && \
    apt-get install -y openssl ca-certificates postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Copy and make entrypoint executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5000

# Set entrypoint for automated migration
ENTRYPOINT ["/docker-entrypoint.sh"]

# Use dev mode for hot reload
CMD ["npm", "run", "dev"]
