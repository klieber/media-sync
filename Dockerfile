FROM node:16.20.1-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --platform=linux --arch=x64 --only=production --ignore-scripts
RUN npm uninstall sharp && npm install --platform=linux --arch=x64 sharp

COPY . .

COPY default-config.json /etc/mediasync/config

VOLUME "/data"
VOLUME "/media/video"
VOLUME "/media/photo"

CMD [ "node", "bin/media-sync.js" ]
