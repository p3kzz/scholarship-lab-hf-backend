FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 7860

ENV PORT=7860

CMD ["node", "src/index.js"]