FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# Install only production dependencies
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Use non-root user
USER node

EXPOSE 3000

CMD ["npm", "start"]
