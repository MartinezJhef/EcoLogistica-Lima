# Etapa 1: compilación con TypeScript y Vite (incluye la precompresión Brotli/gzip)
FROM node:24-alpine AS build

WORKDIR /app
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: servidor estático mínimo, sin dependencias de producción
FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5173

COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs

EXPOSE 5173

CMD ["node", "server.mjs"]
