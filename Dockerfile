FROM node:14.17.1

WORKDIR /usr/src/app

COPY . ./

RUN npm install --only=production

RUN npm run build


CMD [ "npm", "run", "start" ]