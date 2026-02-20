FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .
RUN npx prisma generate
RUN npx tsc

EXPOSE 4000
CMD ["node", "dist/server.js"]