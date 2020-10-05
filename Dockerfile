FROM node:14.13.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

COPY default-config.json /etc/mediasync/config

VOLUME "/data"
VOLUME "/media/video"
VOLUME "/media/photo"

CMD [ "node", "bin/media-sync.js" ]