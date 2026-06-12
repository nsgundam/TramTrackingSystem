FROM node:22-alpine

WORKDIR /app

# Ensure npm version matches the host environment for package-lock parity
RUN npm install -g npm@11.11.0

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code (in dev mode this is overridden by volume mounts)
COPY . .

EXPOSE 3000

# Dev mode: Next.js dev server with hot-reload
# Bind to 0.0.0.0 so it's accessible outside the container
CMD ["npx", "next", "dev", "--hostname", "0.0.0.0"]
