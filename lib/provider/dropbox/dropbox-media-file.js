import logger from '../../support/logger';
import fs from 'fs';

const log = logger.create('lib/provider/dropbox/dropbox-media-file');

class DropboxMediaFile {
  #dropboxService;
  #dropboxFile;
  #localFile;
  #deleted;

  constructor(dropboxService, dropboxFile, localFile) {
    this.#dropboxService = dropboxService;
    this.#dropboxFile = dropboxFile;
    this.#localFile = localFile;
    this.#deleted = false;
  }

  get name() {
    return this.#localFile;
  }

  async delete() {
    if (this.#deleted) {
      throw new Error(`cannot delete file that has already been deleted: ${this.#dropboxFile.name}`);
    }
    log.info(`deleting remote file: ${this.#dropboxFile.name}`);
    await this.#dropboxService.delete(this.#dropboxFile);
    await fs.promises.unlink(this.#localFile);
    this.#deleted = true;
  }
}

module.exports = DropboxMediaFile;
