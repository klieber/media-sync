import MediaFileInfo from './filesystem-media-info';
import fs from 'fs';
import logger from '../../support/logger';

const log = logger.create('lib/provider/filesystem/filesystem-provider');

class FilesystemProvider {
  #source;

  constructor(source) {
    this.#source = source;
  }

  async list() {
    log.debug(`listing files in ${this.#source}`);
    const files = await fs.promises.readdir(this.#source);
    log.debug(`found ${files.length} files in ${this.#source}`);
    return files
      .filter((file) => file.match(/^\w+.*\.\w+$/))
      .map((file) => new MediaFileInfo(`${this.#source}/${file}`));
  }
}

module.exports = FilesystemProvider;
