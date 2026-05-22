FROM node:20-alpine

WORKDIR /app

# Baileys/sodium podem precisar de build tools nativos
RUN apk add --no-cache python3 make g++ git wget

COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

COPY index.js ./

ENV NODE_ENV=production \
    AUTH_DIR=/data/auth \
    PORT=3000

VOLUME ["/data/auth"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/healthz || exit 1

CMD ["node", "index.js"]
