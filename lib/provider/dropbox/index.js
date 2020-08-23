const DropboxService = require('./dropbox-service');
const DropboxProvider = require('./dropbox-provider');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');
const tmp = require('tmp');
tmp.setGracefulCleanup();

module.exports = {
  create: (config) => {
    const dropboxClient = new Dropbox({
      fetch: fetch,
      accessToken: config.access_token
    });
    const dropboxService = new DropboxService(dropboxClient);

    const tmpobj = tmp.dirSync({ template: 'dropbox-XXXXXX', unsafeCleanup: true });

    return new DropboxProvider(dropboxService, config.source, tmpobj.name);
  }
};
