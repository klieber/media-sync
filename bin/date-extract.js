#!/usr/bin/env node

const dateExtractor = require('../lib/support/date-extractor');
const format = require('date-fns/format');
const logger = require('../lib/support/logger').create('bin/date-extract');

(async () => {
  try {
    const timestamp = await dateExtractor.extractDate(process.argv[2]);
    logger.info(format(timestamp, 'yyyy-MM-dd_HH.mm.ss'));
  } catch (error) {
    logger.error(error);
  }
})();
