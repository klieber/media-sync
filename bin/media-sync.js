#!/usr/bin/env node

require('dotenv').config();

const provider = require('../lib/provider').create();
const ImageHandler = require('../lib/handler/image-handler');
const { asyncForEach } = require('../lib/support/async-utils');

const handlers = [new ImageHandler()];

(async () => {
  try {
    const files = await provider.list();

    // TODO: remove the slice call
    await asyncForEach(files.slice(0, 5), async (file) => {
      const handler = handlers.find((handler) => handler.supports(file.path_lower));
      if (handler) {
        try {
          const filename = await provider.download(file);
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
