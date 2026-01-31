FROM node:20-slim AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-slim
WORKDIR /app

RUN apt-get update && apt-get install -y openssl libvips-dev && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir -p uploads

EXPOSE 4000
CMD ["node", "dist/main.js"]