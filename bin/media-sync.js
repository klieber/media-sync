#!/usr/bin/env node

require('dotenv').config();

const logger = require('../lib/support/logger').create('bin/media-sync');
const provider = require('../lib/provider').create();
const ImageHandler = require('../lib/handler/image-handler');
const { asyncForEach } = require('../lib/support/async-utils');

const handlers = [new ImageHandler(process.env.TARGET_PATH)];

(async () => {
  try {
    asyncForEach(await provider.list(), async (mediaInfo) => {
      const handler = handlers.find((handler) => handler.supports(mediaInfo.name));

      if (handler) {
        try {
          logger.info(`downloading ${mediaInfo.name}`);
          const mediaFile = await mediaInfo.get();

          try {
            await handler.handle(mediaFile);
          } catch (error) {
            logger.error(`unable to handle file: ${mediaInfo.name}: `, error);
          }
        } catch (error) {
          logger.error(`unable to download file: ${mediaInfo.name}: `, error);
        }
      } else {
        logger.warn(`unsupported file: ${mediaInfo.name}`);
      }
    });
  } catch (error) {
    logger.error('unable to sync files: ', error);
  }
})();
