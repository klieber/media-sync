const MediaFileInfo = require('./dropbox-media-info');
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
    logger.debug(`found ${response.entries.length} files in ${this.#source}`);
    return response.entries
      .filter((entry) => entry['.tag'] === 'file')
      .filter((entry) => entry.name.match(/^\w+.*\.\w+$/))
      .map((file) => new MediaFileInfo(this.#dropboxService, file, this.#target));
  }
}

module.exports = DropboxProvider;
