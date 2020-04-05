#!/usr/bin/env node

require('dotenv').config();

const DropboxService = require('../lib/provider/dropbox-service');
const DropboxProvider = require('../lib/provider/dropbox-provider');
const ImageHandler = require('../lib/handler/image-handler');
const { asyncForEach } = require('../lib/support/async-utils');

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

const handlers = [new ImageHandler()];

(async () => {
  try {
    const files = await dropboxProvider.list();

    // TODO: remove the slice call
    await asyncForEach(files.slice(0, 5), async (file) => {
      const handler = handlers.find((handler) => handler.supports(file.path_lower));
      if (handler) {
        try {
          const filename = await dropboxProvider.download(file);
          handler.handle(filename);
        } catch (error) {
          console.log(`Unable to download file: ${file.path_lower}`, error);
        }
      } else {
        console.log(`Unsupported file: ${file.path_lower}`);
      }
    });
    console.log('done');
  } catch (error) {
    console.log('Unable retrieve files:', error);
  }
})();
