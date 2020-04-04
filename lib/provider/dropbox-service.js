const fs = require('fs-extra');
const fsRxjs = require('../fs-rxjs');
const { defer } = require('rxjs');
const assert = require('assert').strict;
const { map, reduce } = require('rxjs/operators');
const DropboxContentHasher = require('./dropbox-content-hasher');

class DropboxService {
  #dropboxClient;

  constructor(dropboxClient) {
    this.#dropboxClient = dropboxClient;
  }

  listFiles(path) {
    return defer(() =>
      this.#dropboxClient.filesListFolder({ path: path, include_non_downloadable_files: false })
    );
  }

  async downloadAndVerify(file, target) {
    const filename = await this.download(file.path_lower, target);
    const actualHash = await this.hash(filename).toPromise();

    assert.equal(actualHash, file.content_hash);

    return filename;
  }

  async download(filePath, target) {
    const data = await this.#dropboxClient.filesDownload({ path: filePath });

    await fs.mkdirp(target);
    await fs.writeFile(`${target}/${data.name}`, data.fileBinary, 'binary');

    return `${target}/${data.name}`;
  }

  hash(filename) {
    return fsRxjs.read(filename).pipe(
      reduce((hasher, buffer) => hasher.update(buffer), new DropboxContentHasher()),
      map((hasher) => hasher.digest('hex'))
    );
  }
}

module.exports = DropboxService;
