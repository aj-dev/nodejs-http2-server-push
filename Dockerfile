FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

EXPOSE 8080

CMD ["npm", "start"]

COPY . .
