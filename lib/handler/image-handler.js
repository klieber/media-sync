// const { extractDate } = require('../support/date-extractor');
const { createFileCoordinates } = require('../support/file-namer.js');
const fs = require('fs');

class ImageHandler {
  #target;

  constructor(target) {
    this.#target = target;
  }

  supports(filename) {
    return filename.match(/\.(?:jpg|jpeg|png)/, '');
  }

  async handle(filename) {
    console.log(`ImageHandler processing ${filename}`);

    const coordinates = await createFileCoordinates(this.#target, filename);
    await fs.promises.mkdir(coordinates.dirname, { recursive: true });
    await fs.promises.rename(filename, coordinates.name);

    console.log(`ImageHandler renamed ${filename} to ${coordinates.name}`);
  }
}

module.exports = ImageHandler;
