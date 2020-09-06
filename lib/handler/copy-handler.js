const { moveFile } = require('../support/file-utils.js');
const logger = require('../support/logger').create('lib/handler/copy-handler');
const config = require('../config');

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
      if (!config.dry_run) {
        await mediaFile.delete();
      }
    } catch (error) {
      if (error.message.match(/^file already exists:/)) {
        logger.warn(error.message);
        if (config.delete_duplicates === true && !config.dry_run) {
          await mediaFile.delete();
        }
      } else {
        logger.error(error.message);
      }
    }
  }
}

module.exports = CopyHandler;
