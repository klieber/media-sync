import fs from 'fs';

class DropboxTokenStore {
  #location;
  #token;

  constructor(location) {
    this.#location = location;
    this.#token = null;
  }

  read() {
    if (!this.#token && fs.existsSync(this.#location)) {
      this.#token = JSON.parse(fs.readFileSync(this.#location), (key, value) => {
        if (key === 'accessTokenExpiresAt') {
          return new Date(value);
        }
        return value;
      });
    }
    return this.#token;
  }

  store(token) {
    fs.writeFileSync(this.#location, JSON.stringify(token));
  }
}

module.exports = DropboxTokenStore;
