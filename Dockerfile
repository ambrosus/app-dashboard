FROM node:9 as builder

WORKDIR /app

COPY ./package.json /app/
COPY ./package-lock.json /app/

RUN npm install

COPY . ./

RUN npm run build

FROM nginx:1.15.5-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
