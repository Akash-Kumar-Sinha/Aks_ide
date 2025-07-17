FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm install

COPY . .

RUN npm run build

FROM nginx:alpine

WORKDIR /user/src/app

COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]