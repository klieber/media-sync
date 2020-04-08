#!/usr/bin/env node

require('dotenv').config();

const logger = require('../lib/support/logger').create('bin/media-sync');
const provider = require('../lib/provider').create();
const ImageHandler = require('../lib/handler/image-handler');
const { asyncForEach } = require('../lib/support/async-utils');

const handlers = [new ImageHandler(process.env.TARGET_PATH)];

(async () => {
  try {
    const files = await provider.list();
    // TODO: remove the slice call
    await asyncForEach(files, async (file) => {
      const handler = handlers.find((handler) => handler.supports(file.remoteFile));
      if (handler) {
        try {
          await file.download();
          await handler.handle(file);
        } catch (error) {
          logger.error(`unable to download file: ${file.remoteFile}: `, error);
        }
      } else {
        logger.warn(`unsupported file: ${file.remoteFile}`);
      }
    });
  } catch (error) {
    logger.error('unable to sync files: ', error);
  }
})();
