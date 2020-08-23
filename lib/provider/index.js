const dropbox = require('./dropbox');
const config = require('../config');

const PROVIDERS = {
  dropbox: dropbox
};

module.exports = {
  create: () => {
    const type = config.provider.type || 'dropbox';
    const provider = PROVIDERS[type];

    if (!provider) {
      throw new Error(`Provider not supported: ${type}`);
    }

    return provider.create(config.provider);
  }
};
