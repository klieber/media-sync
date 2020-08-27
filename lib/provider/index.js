const dropboxProvider = require('./dropbox');
const filesystemProvider = require('./filesystem');
const config = require('../config');
const CompositeProvider = require('./composite-provider');

const PROVIDERS = {
  dropbox: dropboxProvider,
  filesystem: filesystemProvider
};

module.exports = {
  create: async () => {
    if (!config.providers || config.providers.length === 0) {
      throw new Error(`At least one provider must be configured. Supported providers: ${Object.keys(PROVIDERS)}`);
    }

    config.providers.forEach((providerConfig) => {
      if (!PROVIDERS[providerConfig.type]) {
        throw new Error(
          `Provider not supported: ${providerConfig.type}. Supported providers: ${Object.keys(PROVIDERS)}`
        );
      }
    });

    const providers = await Promise.all(
      config.providers.map((providerConfig) => PROVIDERS[providerConfig.type].create(providerConfig))
    );

    return providers.length > 1 ? new CompositeProvider(providers) : providers[0];
  }
};
