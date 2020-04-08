const { moveFile } = require('../support/file-utils.js');
const logger = require('../support/logger').create('lib/handler/image-handler');

class ImageHandler {
  #target;

  constructor(target) {
    this.#target = target;
  }

  supports(filename) {
    return filename.match(/\.(?:jpg|jpeg|png)/, '');
  }

  async handle(mediaFile) {
    try {
      await moveFile(mediaFile.sourceFile, this.#target);
      await mediaFile.delete();
    } catch (error) {
      logger.error(error.message);
    }
  }
}

module.exports = ImageHandler;
