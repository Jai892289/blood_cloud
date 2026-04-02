# Use Node
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start production server
CMD ["npm", "start"]