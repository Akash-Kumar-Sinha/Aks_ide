FROM node:20

WORKDIR /app

COPY package* .
COPY ./prisma .

RUN npm install

COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000 9000

CMD ["npm", "run", "dev"]