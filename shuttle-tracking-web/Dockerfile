# --- Base Stage ---
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g npm@11.11.0
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# --- Development Target ---
FROM base AS development
EXPOSE 3000
CMD ["npx", "next", "dev", "--hostname", "0.0.0.0"]

# --- Builder Stage for Production ---
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

# --- Production Target ---
FROM node:22-alpine AS production
WORKDIR /app
RUN npm install -g npm@11.11.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npx", "next", "start", "--hostname", "0.0.0.0"]
