# AWS App Runner Dockerfile for Backend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code
COPY backend/ ./

# Expose port 3002
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# Start the server
CMD ["node", "server-apprunner.js"]