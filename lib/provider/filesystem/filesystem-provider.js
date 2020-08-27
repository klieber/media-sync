const MediaFileInfo = require('./filesystem-media-info');
const fs = require('fs');
const logger = require('../../support/logger').create('lib/provider/filesystem/filesystem-provider');

class FilesystemProvider {
  #source;

  constructor(source) {
    this.#source = source;
  }

  async list() {
    logger.debug(`listing files in ${this.#source}`);
    const files = await fs.promises.readdir(this.#source);
    logger.debug(`found ${files.length} files in ${this.#source}`);
    return files
      .filter((file) => file.match(/^\w+.*\.\w+$/))
      .map((file) => new MediaFileInfo(`${this.#source}/${file}`));
  }
}

module.exports = FilesystemProvider;
