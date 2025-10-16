FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build static assets for production
RUN npm run build

# Static files are now in /app/dist/
# Digital Ocean will serve these files directly
