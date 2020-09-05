const DropboxService = require('./dropbox-service');
const DropboxProvider = require('./dropbox-provider');
const DropboxClientFactory = require('./dropbox-client-factory');
const tmp = require('tmp');
tmp.setGracefulCleanup();

const DEFAULTS = {
  source: '/Camera Uploads',
  token_store: './.dropbox-token',
  auth_code: process.env.DROPBOX_AUTH_CODE
};

module.exports = {
  create: async (config) => {
    config = Object.assign({}, DEFAULTS, config);

    const dropboxClient = await DropboxClientFactory.create(config);

    const dropboxService = new DropboxService(dropboxClient);

    const tmpobj = tmp.dirSync({ template: 'dropbox-XXXXXX', unsafeCleanup: true });

    return new DropboxProvider(dropboxService, config.source, tmpobj.name);
  }
};
