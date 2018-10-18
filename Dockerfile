FROM node:9 as builder

WORKDIR /app

COPY ./package.json /app/

RUN npm install

COPY . ./

RUN npm run build

FROM nginx:1.15.5-alpine

# copy artifact build from the 'build environment'
COPY --from=builder /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# run nginx
CMD ["nginx", "-g", "daemon off;"]


