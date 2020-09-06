#!/usr/bin/env node

const dateExtractor = require('../lib/support/date-extractor');
const format = require('date-fns/format');

(async () => {
  const timestamp = await dateExtractor.extractDate(process.argv[2]);
  console.log(format(timestamp, 'yyyy-MM-dd_HH.mm.ss'));
})();
