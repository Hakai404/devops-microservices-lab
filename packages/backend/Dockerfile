# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for nodemon)
RUN npm ci

# Copy application source
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application with nodemon for development
CMD ["npm", "start"]
