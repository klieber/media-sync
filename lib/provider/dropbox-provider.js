const { defer } = require('rxjs');
const { concatMap, take } = require('rxjs/operators');

class DropboxProvider {
  #dropboxService;
  #source;
  #target;

  constructor(dropboxService, source, target) {
    this.#dropboxService = dropboxService;
    this.#source = source;
    this.#target = target;
  }

  list() {
    return this.#dropboxService.listFiles(this.#source).pipe(
      concatMap((response) => response.entries),
      take(10)
    );
  }

  download(file) {
    console.log(`downloading ${file.path_lower}`);
    return defer(() => this.#dropboxService.downloadAndVerify(file, this.#target));
  }
}

module.exports = DropboxProvider;
