# ---------- Base ----------
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Set production mode
ENV NODE_ENV=production

# Expose port (your app uses config.port)
EXPOSE 3022

# Start app
CMD ["node", "src/index.js"]
