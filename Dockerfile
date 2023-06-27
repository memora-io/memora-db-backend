FROM node:16-alpine
WORKDIR /usr/memora
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["node", "./dist/server.js"]git 