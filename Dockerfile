FROM node:12-alpine
WORKDIR /usr/src/app

COPY package*.json ./
COPY *.js ./
COPY yarn.lock ./

RUN npm install yarn && \
    yarn && \
    yarn cache clean
CMD [ "yarn", "start" ]
