const DropboxMediaFile = require('./dropbox-media-file');
const logger = require('../../support/logger').create('lib/provider/dropbox/dropbox-provider');

class DropboxProvider {
  #dropboxService;
  #source;
  #target;

  constructor(dropboxService, source, target) {
    this.#dropboxService = dropboxService;
    this.#source = source;
    this.#target = target;
  }

  async list() {
    logger.debug(`listing files in ${this.#source}`);
    const response = await this.#dropboxService.listFiles(this.#source);
    return response.entries
      .filter((entry) => entry['.tag'] === 'file')
      .map((file) => new DropboxMediaFile(this.#dropboxService, file, this.#target));
  }
}

module.exports = DropboxProvider;
