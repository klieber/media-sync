const dropbox = require('./dropbox');
const config = require('../config');

const PROVIDERS = {
  dropbox: dropbox
};

module.exports = {
  create: async () => {
    if (!config.provider) {
      throw new Error(`Provider has not been configured. Supported providers: ${Object.keys(PROVIDERS)}`);
    }

    const type = config.provider.type || 'dropbox';
    const provider = PROVIDERS[type];

    if (!provider) {
      throw new Error(`Provider not supported: ${type}. Supported providers: ${Object.keys(PROVIDERS)}`);
    }

    return await provider.create(config.provider);
  }
};
