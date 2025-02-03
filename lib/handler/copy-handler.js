import { moveFile } from '../support/file-utils.js';
import logger from '../support/logger';
import config from '../config';

const log = logger.create('lib/handler/copy-handler');

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
        log.warn(error.message);
        if (config.delete_duplicates === true && !config.dry_run) {
          await mediaFile.delete();
        }
      } else {
        log.error(error.message);
      }
    }
  }
}

module.exports = CopyHandler;
