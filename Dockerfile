FROM node:18-alpine

WORKDIR /app

RUN yarn config set "strict-ssl" false

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 5173

CMD ["yarn", "run", "dev"]
