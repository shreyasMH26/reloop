# Multi-stage Dockerfile for ReLoop Platform
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Vite frontend and verify TypeScript
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV ALLOW_DEMO_STORE=true

COPY package*.json ./
RUN npm install --omit=dev && npm install -g tsx

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
COPY --from=builder /app/supabase ./supabase

EXPOSE 4000

CMD ["tsx", "server/index.ts"]
