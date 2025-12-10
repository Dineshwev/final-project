# AWS App Runner Dockerfile for Backend
FROM node:18-alpine

# Set working directory to app root
WORKDIR /app

# Copy entire project first
COPY . .

# Navigate to backend and install dependencies
WORKDIR /app/backend
RUN npm install --production

# Verify server file exists
RUN ls -la server-apprunner.js

# Expose port 3002
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# Start the server from backend directory
CMD ["node", "server-apprunner.js"]