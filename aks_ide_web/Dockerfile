FROM node:18-alpine AS build

WORKDIR /user/src/app

COPY ./package*.json ./

RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm \
    npm install

COPY . .

RUN npm run build

ENV PORT=5173

EXPOSE 5173

CMD ["npx", "serve", "-s", "dist", "-l", "5173"]


