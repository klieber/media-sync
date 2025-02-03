import FilesystemProvider from './filesystem-provider';

module.exports = {
  create: async (config) => {
    return new FilesystemProvider(config.source);
  }
};
