# ---------- 1. Base ----------
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy full project
COPY . .

# Build app
RUN npm run build

# Set env
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Expose port
EXPOSE 3000

# Start Next.js app
CMD ["npm", "start"]
