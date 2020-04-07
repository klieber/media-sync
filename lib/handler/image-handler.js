// const { extractDate } = require('../support/date-extractor');
const { createFileCoordinates } = require('../support/file-namer.js');
const fs = require('fs');
const logger = require('../support/logger').create('lib/handler/image-handler');

class ImageHandler {
  #target;

  constructor(target) {
    this.#target = target;
  }

  supports(filename) {
    return filename.match(/\.(?:jpg|jpeg|png)/, '');
  }

  async handle(filename) {
    const coordinates = await createFileCoordinates(this.#target, filename);

    logger.info(`moving ${filename} to ${coordinates.name}`);

    await fs.promises.mkdir(coordinates.dirname, { recursive: true });
    await fs.promises.rename(filename, coordinates.name);
  }
}

module.exports = ImageHandler;
