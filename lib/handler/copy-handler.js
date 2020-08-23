const { moveFile } = require('../support/file-utils.js');
const logger = require('../support/logger').create('lib/handler/copy-handler');

class CopyHandler {
  #extensions;
  #target;

  constructor(extensions, target) {
    this.#extensions = extensions;
    this.#target = target;
  }

  supports(filename) {
    let match = filename.toLowerCase().match(/\.([^.]+)$/);
    return match && this.#extensions.includes(match[1]);
  }

  async handle(mediaFile) {
    try {
      await moveFile(mediaFile.name, this.#target);
      await mediaFile.delete();
    } catch (error) {
      if (error.message.match(/^file already exists:/)) {
        logger.warn(error.message);
      } else {
        logger.error(error.message);
      }
    }
  }
}

module.exports = CopyHandler;
