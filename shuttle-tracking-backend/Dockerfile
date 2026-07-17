# --- Base Stage ---
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g npm@11.11.0
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate
COPY . .

# --- Development Target ---
FROM base AS development
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "nodemon"]

# --- Builder Stage for Production ---
FROM base AS builder
RUN npm run build

# --- Production Target ---
FROM node:22-alpine AS production
WORKDIR /app
RUN npm install -g npm@11.11.0
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
