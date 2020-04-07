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
    const response = await this.#dropboxService.listFiles(this.#source);
    return response.entries.filter((entry) => entry['.tag'] === 'file');
  }

  async download(file) {
    logger.info(`downloading ${file.path_lower}`);
    return await this.#dropboxService.downloadAndVerify(file, this.#target);
  }
}

module.exports = DropboxProvider;
