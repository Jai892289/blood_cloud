# Use Node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all code
COPY . .

# Expose port
EXPOSE 5000

# Start app
# CMD ["sh", "-c", "npx drizzle-kit push && npm run dev"]
CMD ["sh", "-c", "npx drizzle-kit migrate && npm start"]