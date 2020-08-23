const fs = require('fs');

class DropboxTokenStore {
  #location;
  #token;

  constructor(location) {
    this.#location = location;
    this.#token = null;
  }

  read() {
    if (!this.#token && fs.existsSync(this.#location)) {
      this.#token = JSON.parse(fs.readFileSync(this.#location));
    }
    return this.#token;
  }

  store(token) {
    fs.writeFileSync(this.#location, JSON.stringify(token));
  }
}

module.exports = DropboxTokenStore;
