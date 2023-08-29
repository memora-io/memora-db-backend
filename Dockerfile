FROM --platform=linux/amd64 node:18-alpine AS builder

WORKDIR /usr/memora

RUN npm install prisma
COPY prisma ./prisma/
RUN npx prisma generate

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY . .
RUN npm run build

FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

COPY --from=builder /usr/memora/node_modules ./node_modules
COPY --from=builder /usr/memora/package*.json ./
COPY --from=builder /usr/memora/dist ./dist

EXPOSE 3000
CMD ["node", "./dist/server.js"]