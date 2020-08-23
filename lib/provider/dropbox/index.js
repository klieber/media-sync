const DropboxService = require('./dropbox-service');
const DropboxProvider = require('./dropbox-provider');
const DropboxClientFactory = require('./dropbox-client-factory');
const tmp = require('tmp');
tmp.setGracefulCleanup();

module.exports = {
  create: async (config) => {
    const dropboxClient = await DropboxClientFactory.create(config);

    const dropboxService = new DropboxService(dropboxClient);

    const tmpobj = tmp.dirSync({ template: 'dropbox-XXXXXX', unsafeCleanup: true });

    return new DropboxProvider(dropboxService, config.source, tmpobj.name);
  }
};
