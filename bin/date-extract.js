#!/usr/bin/env node

import dateExtractor from '../lib/support/date-extractor';
import { format as formatDate } from 'date-fns';
import logger from '../lib/support/logger';

const log = logger.create('bin/date-extract');

(async () => {
  try {
    const timestamp = await dateExtractor.extractDate(process.argv[2]);
    log.info(formatDate(timestamp, 'yyyy-MM-dd_HH.mm.ss'));
  } catch (error) {
    log.error(error);
  }
})();
