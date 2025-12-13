# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package.json ./backend/
# Copy package-lock.json if it exists (optional)
COPY backend/package-lock.json* ./backend/

# Install dependencies
WORKDIR /app/backend
RUN npm install --only=production

# Copy backend source code
WORKDIR /app
COPY backend/ ./backend/

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000

# Health check - wait for server to start, then check /health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start the server
WORKDIR /app/backend
CMD ["node", "server.js"]