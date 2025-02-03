import fs from 'fs';
import https from 'https';
import assert from 'assert/strict';
import DropboxContentHasher from './dropbox-content-hasher';

function isFailure(statusCode) {
  let result = statusCode < 200 || statusCode >= 300;
  return result;
}

class DropboxService {
  #dropboxClient;

  constructor(dropboxClient) {
    this.#dropboxClient = dropboxClient;
  }

  async listFiles(path) {
    await this.#dropboxClient.auth.checkAndRefreshAccessToken();
    let response = await this.#dropboxClient.filesListFolder({
      path: path,
      include_non_downloadable_files: false
    });
    if (isFailure(response.status)) {
      throw new Error(`Unable to list files in path '${path}': ${response.status}`);
    }
    return response.result;
  }

  async downloadAndVerify(file, target) {
    const filename = await this.downloadLargeFile(file.path_lower, target);
    const actualHash = await this.hash(filename);

    assert.equal(actualHash, file.content_hash);

    return filename;
  }

  async download(filePath, target) {
    await this.#dropboxClient.auth.checkAndRefreshAccessToken();

    const response = await this.#dropboxClient.filesDownload({ path: filePath });
    if (isFailure(response.status)) {
      throw new Error(`Unable to download '${filePath}': ${response.status}`);
    }
    const data = response.result;
    const fileDate = new Date(data.client_modified);

    await fs.promises.mkdir(target, { recursive: true });
    await fs.promises.writeFile(`${target}/${data.name}`, data.fileBinary, 'binary');
    await fs.promises.utimes(`${target}/${data.name}`, fileDate, fileDate);

    return `${target}/${data.name}`;
  }

  async downloadLargeFile(path, target) {
    await this.#dropboxClient.auth.checkAndRefreshAccessToken();

    const response = await this.#dropboxClient.filesGetTemporaryLink({ path: path });
    if (isFailure(response.status)) {
      throw new Error(`Unable to download '${path}': ${response.status}`);
    }
    const { metadata, link } = response.result;

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
    await this.#dropboxClient.auth.checkAndRefreshAccessToken();
    const response = await this.#dropboxClient.filesDelete({ path: file.path_lower });
    if (isFailure(response.status)) {
      throw new Error(`Unable to delete '${file.path_lower}': ${response.status}`);
    }
    return response.result;
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
