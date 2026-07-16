# ==========================================
# Stage 1: Build the TypeScript code
# ==========================================

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ==========================================
# Stage 2: Install Production Dependencies
# ==========================================
FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./

# Install ONLY production dependencies to keep the image lean
RUN npm ci --omit=dev


# ==========================================
# Stage 3: Production Runner
# ==========================================

FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

USER node

# Copy ONLY the necessary files from the previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# (Optional) copy static assets
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/public ./public

# (Optional) copy .env.production
# COPY .env.production .env.production

EXPOSE 5701

CMD ["node", "dist/main.js"]