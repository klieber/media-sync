const fs = require('fs');
const assert = require('assert').strict;
const DropboxContentHasher = require('./dropbox-content-hasher');

class DropboxService {
  #dropboxClient;

  constructor(dropboxClient) {
    this.#dropboxClient = dropboxClient;
  }

  async listFiles(path) {
    return await this.#dropboxClient.filesListFolder({
      path: path,
      include_non_downloadable_files: false
    });
  }

  async downloadAndVerify(file, target) {
    const filename = await this.download(file.path_lower, target);
    const actualHash = await this.hash(filename);

    assert.equal(actualHash, file.content_hash);

    return filename;
  }

  async download(filePath, target) {
    const data = await this.#dropboxClient.filesDownload({ path: filePath });
    const fileDate = new Date(data.client_modified);

    await fs.promises.mkdir(target, { recursive: true });
    await fs.promises.writeFile(`${target}/${data.name}`, data.fileBinary, 'binary');
    await fs.promises.utimes(`${target}/${data.name}`, fileDate, fileDate);

    return `${target}/${data.name}`;
  }

  async hash(filename) {
    const hasher = new DropboxContentHasher();
    const stream = fs.createReadStream(filename);
    for await (const buffer of stream) {
      hasher.update(buffer);
    }
    return hasher.digest('hex');
  }
}

module.exports = DropboxService;
