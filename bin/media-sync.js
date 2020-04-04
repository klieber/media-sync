#!/usr/bin/env node

require('dotenv').config();

const { filter, concatMap } = require('rxjs/operators');
const DropboxService = require('../lib/provider/dropbox-service');
const DropboxProvider = require('../lib/provider/dropbox-provider');
const ImageHandler = require('../lib/handler/image-handler');

const { Dropbox } = require('dropbox');

const dropboxClient = new Dropbox({
  fetch: require('node-fetch'),
  accessToken: process.env.DROPBOX_ACCESS_TOKEN
});

const config = {
  source: process.env.SOURCE_PATH,
  target: process.env.TARGET_PATH
};

const dropboxService = new DropboxService(dropboxClient);
const dropboxProvider = new DropboxProvider(dropboxService, config.source, config.target);
const imageHandler = new ImageHandler();

dropboxProvider
  .list()
  .pipe(
    filter((file) => imageHandler.supports(file.path_lower)),
    concatMap((file) => dropboxProvider.download(file))
  )
  .subscribe(
    (filename) => imageHandler.handle(filename),
    (error) => console.error(error),
    () => console.log('done')
  );
