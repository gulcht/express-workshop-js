FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose port (default 3000 for Express app)
EXPOSE 3000

# Set environment variable default
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]
