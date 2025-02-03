import dropboxProvider from './dropbox';
import filesystemProvider from './filesystem';
import config from '../config';
import CompositeProvider from './composite-provider';

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
      config.providers.map((providerConfig) => {
        if (config.providerDefaults && config.providerDefaults[providerConfig.type]) {
          providerConfig = Object.assign({}, config.providerDefaults[providerConfig.type], providerConfig);
        }
        return PROVIDERS[providerConfig.type].create(providerConfig);
      })
    );

    return providers.length > 1 ? new CompositeProvider(providers) : providers[0];
  }
};
