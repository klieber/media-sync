const DropboxMediaFile = require('./dropbox-media-file');

class DropboxMediaInfo {
  #dropboxService;
  #dropboxFile;
  #target;

  constructor(dropboxService, dropboxFile, target) {
    this.#dropboxService = dropboxService;
    this.#dropboxFile = dropboxFile;
    this.#target = target;
  }

  get name() {
    return this.#dropboxFile.name;
  }

  async get() {
    const sourceFile = await this.#dropboxService.downloadAndVerify(this.#dropboxFile, this.#target);
    return new DropboxMediaFile(this.#dropboxService, this.#dropboxFile, sourceFile);
  }
}

module.exports = DropboxMediaInfo;
