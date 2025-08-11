FROM node:18-alpine
RUN apk update && apk add curl
WORKDIR /app
COPY ./mnav-backend-pure/app ./app/
COPY ./mnav-backend-pure/core ./core/
WORKDIR /app/app
RUN npm install
WORKDIR /app/core
RUN npm install
WORKDIR /app/core
EXPOSE 8001
CMD ["node", "main.js"]