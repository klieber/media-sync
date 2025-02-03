import DropboxService from './dropbox-service';
import DropboxProvider from './dropbox-provider';
import DropboxClientFactory from './dropbox-client-factory';
import tmp from 'tmp';

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
