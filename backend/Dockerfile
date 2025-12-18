FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm install -g ts-node typescript

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build || true

EXPOSE 5000

CMD ["npm", "run", "dev"]
