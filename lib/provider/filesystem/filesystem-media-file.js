const logger = require('../../support/logger').create('lib/provider/filesystem/filesystem-media-file');
const fs = require('fs');

class FilesystemMediaFile {
  #file;
  #deleted;

  constructor(file) {
    this.#file = file;
    this.#deleted = false;
  }

  get name() {
    return this.#file;
  }

  async delete() {
    if (this.#deleted) {
      throw new Error(`cannot delete file that has already been deleted: ${this.#file}`);
    }
    logger.info(`deleting file: ${this.#file}`);
    await fs.promises.unlink(this.#file);
    this.#deleted = true;
  }
}

module.exports = FilesystemMediaFile;
