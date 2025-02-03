#!/usr/bin/env node
import config from '../lib/config';

import { CronJob } from 'cron';
import logger from '../lib/support/logger';
import ProviderFactory from '../lib/provider';
import CopyHandler from '../lib/handler/copy-handler';
import { asyncForEach } from '../lib/support/async-utils';

const log = logger.create('bin/media-sync');

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
          log.debug('starting synchronization');
          await asyncForEach(await provider.list(), async (mediaInfo) => {
            const handler = handlers.find((handler) => handler.supports(mediaInfo.name));

            if (handler) {
              try {
                log.info(`retrieving ${mediaInfo.name}`);
                const mediaFile = await mediaInfo.get();

                try {
                  await handler.handle(mediaFile);
                } catch (error) {
                  log.error(`unable to handle file: ${mediaInfo.name}: `, error);
                }
              } catch (error) {
                log.error(`unable to download file: ${mediaInfo.name}: `, error);
              }
            } else {
              log.warn(`unsupported file: ${mediaInfo.name}`);
            }
          });
        } catch (error) {
          log.error('unable to sync files: ', error);
        }
        log.debug('synchronization finished');
        running = false;
      } else {
        log.warn('skipping next scheduled synchronization (already running)');
      }
    });

    job.start();
  } catch (error) {
    log.error('unable to start media-sync: ', error);
  }
})();
