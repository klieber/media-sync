const FilesystemMediaFile = require('./filesystem-media-file');

class FilesystemMediaInfo {
  #file;

  constructor(file) {
    this.#file = file;
  }

  get name() {
    return this.#file;
  }

  async get() {
    return new FilesystemMediaFile(this.#file);
  }
}

module.exports = FilesystemMediaInfo;
