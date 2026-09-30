# ==========================================
# Stage 1: Build
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ==========================================
# Stage 2: Production
# ==========================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install build dependencies for native modules during production install
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

# Clean up build tools to keep image size small
RUN apk del python3 make g++

COPY --from=builder --chown=node:node /app/dist ./dist

USER node

ENV PORT=5000
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD sh -c "wget --no-verbose --tries=1 --spider http://localhost:\${PORT}/health || exit 1"

CMD ["node", "dist/server.js"]

