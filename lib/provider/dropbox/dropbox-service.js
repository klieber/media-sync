const fs = require('fs');
const https = require('https');
const assert = require('assert').strict;
const DropboxContentHasher = require('./dropbox-content-hasher');

class DropboxService {
  #dropboxClient;

  constructor(dropboxClient) {
    this.#dropboxClient = dropboxClient;
  }

  async listFiles(path) {
    await this.#dropboxClient.checkAndRefreshAccessToken();
    return await this.#dropboxClient.filesListFolder({
      path: path,
      include_non_downloadable_files: false
    });
  }

  async downloadAndVerify(file, target) {
    const filename = await this.downloadLargeFile(file.path_lower, target);
    const actualHash = await this.hash(filename);

    assert.equal(actualHash, file.content_hash);

    return filename;
  }

  async download(filePath, target) {
    await this.#dropboxClient.checkAndRefreshAccessToken();

    const data = await this.#dropboxClient.filesDownload({ path: filePath });
    const fileDate = new Date(data.client_modified);

    await fs.promises.mkdir(target, { recursive: true });
    await fs.promises.writeFile(`${target}/${data.name}`, data.fileBinary, 'binary');
    await fs.promises.utimes(`${target}/${data.name}`, fileDate, fileDate);

    return `${target}/${data.name}`;
  }

  async downloadLargeFile(path, target) {
    await this.#dropboxClient.checkAndRefreshAccessToken();

    const { metadata, link } = await this.#dropboxClient.filesGetTemporaryLink({ path: path });

    await fs.promises.mkdir(target, { recursive: true });

    await new Promise((resolve, reject) => {
      https
        .get(link, (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Unable to download file '${path}': ${res.statusCode} ${res.statusMessage}`));
          } else {
            res.pipe(fs.createWriteStream(`${target}/${metadata.name}`));
            res.on('end', resolve);
          }
        })
        .on('error', reject);
    });

    const fileDate = new Date(metadata.client_modified);
    await fs.promises.utimes(`${target}/${metadata.name}`, fileDate, fileDate);

    return `${target}/${metadata.name}`;
  }

  async delete(file) {
    await this.#dropboxClient.checkAndRefreshAccessToken();
    return await this.#dropboxClient.filesDelete({ path: file.path_lower });
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
