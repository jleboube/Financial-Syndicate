# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --frozen-lockfile || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built application
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Use uncommon port 47823
EXPOSE 47823

# Run the application
CMD ["serve", "-s", "dist", "-l", "47823"]