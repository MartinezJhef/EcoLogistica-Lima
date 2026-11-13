# Etapa 1: compilación con TypeScript y Vite (incluye la precompresión Brotli/gzip)
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: servidor estático mínimo, sin dependencias de producción
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5173

COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 5173

CMD ["node", "server.mjs"]
