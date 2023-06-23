#!/usr/bin/env node
const config = require('../lib/config');

const { CronJob } = require('cron');
const logger = require('../lib/support/logger').create('bin/media-sync');
const ProviderFactory = require('../lib/provider');
const CopyHandler = require('../lib/handler/copy-handler');
const { asyncForEach } = require('../lib/support/async-utils');

(async () => {
  try {
    if (!config.handlers || config.handlers.length < 1) {
      throw new Error('At least one handler must be configured.');
    }

    const handlers = config.handlers.map(
      (handlerConfig) => new CopyHandler(handlerConfig.extensions, handlerConfig.conversions, handlerConfig.target)
    );

    const provider = await ProviderFactory.create();

    let running = false;
    const job = new CronJob(config.schedule, async () => {
      if (!running) {
        running = true;
        try {
          logger.debug('starting synchronization');
          await asyncForEach(await provider.list(), async (mediaInfo) => {
            const handler = handlers.find((handler) => handler.supports(mediaInfo.name));

            if (handler) {
              try {
                logger.info(`retrieving ${mediaInfo.name}`);
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
        logger.debug('synchronization finished');
        running = false;
      } else {
        logger.warn('skipping next scheduled synchronization (already running)');
      }
    });

    job.start();
  } catch (error) {
    logger.error('unable to start media-sync: ', error);
  }
})();
