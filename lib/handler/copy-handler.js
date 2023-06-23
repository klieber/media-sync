const { moveFile } = require('../support/file-utils.js');
const logger = require('../support/logger').create('lib/handler/copy-handler');
const config = require('../config');

class CopyHandler {
  #extensions;
  #conversions;
  #target;

  constructor(extensions, conversions, target) {
    this.#extensions = extensions;
    this.#conversions = conversions;
    this.#target = target;
  }

  supports(filename) {
    let match = filename.toLowerCase().match(/\.([^.]+)$/);
    return match && this.#extensions.includes(match[1]);
  }

  async handle(mediaFile) {
    try {
      await moveFile(mediaFile.name, this.#target, this.#conversions);
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
