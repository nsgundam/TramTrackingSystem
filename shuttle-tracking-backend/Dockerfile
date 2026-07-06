FROM node:22-alpine

WORKDIR /app

# Ensure npm version matches the host environment for package-lock parity
RUN npm install -g npm@11.11.0

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy Prisma schema & generate client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source code (in dev mode this is overridden by volume mounts)
COPY . .

# Copy and set entrypoint (auto-runs migrations & seed on startup)
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]

# Dev mode: use nodemon for hot-reload
CMD ["npx", "nodemon"]
