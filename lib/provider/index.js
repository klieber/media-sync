const dropbox = require('./dropbox');

const PROVIDERS = {
  dropbox: dropbox
};

module.exports = {
  create: () => {
    const type = process.env.PROVIDER || 'dropbox';
    const provider = PROVIDERS[type];

    if (!provider) {
      throw new Error(`Provider not supported: ${type}`);
    }

    return provider.create();
  }
};
