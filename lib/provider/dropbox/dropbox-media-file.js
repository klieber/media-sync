const logger = require('../../support/logger').create('lib/provider/dropbox/dropbox-media-file');
const fs = require('fs');

class DropboxMediaFile {
  #dropboxService;
  #dropboxFile;
  #storagePath;
  #sourceFile;
  #deleted;

  constructor(dropboxService, dropboxFile, storagePath) {
    this.#dropboxService = dropboxService;
    this.#dropboxFile = dropboxFile;
    this.#storagePath = storagePath;
    this.#deleted = false;
  }

  get fileType() {
    return this.#dropboxFile.name.replace(/^.*\.([^\w]+)/, '$1');
  }

  get sourceFile() {
    return this.#sourceFile;
  }

  get remoteFile() {
    return this.#dropboxFile.name;
  }

  async download() {
    if (this.#deleted) {
      throw new Error(`cannot download file that has been deleted: ${this.remoteFile}`);
    } else if (this.#sourceFile) {
      throw new Error(`already downloaded: ${this.#sourceFile}`);
    } else {
      logger.info(`downloading ${this.remoteFile}`);
      this.#sourceFile = await this.#dropboxService.downloadAndVerify(this.#dropboxFile, this.#storagePath);
    }
  }

  async delete() {
    if (this.#deleted) {
      throw new Error(`cannot delete file that has already been deleted: ${this.#sourceFile}`);
    }
    logger.info(`deleting remote file: ${this.remoteFile}`);
    await this.#dropboxService.delete(this.#dropboxFile);
    await fs.promises.unlink(this.#sourceFile);
    this.#deleted = true;
  }
}

module.exports = DropboxMediaFile;
