const DropboxService = require('./dropbox-service');
const DropboxProvider = require('./dropbox-provider');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');
const tmp = require('tmp');
tmp.setGracefulCleanup();

module.exports = {
  create: () => {
    const dropboxClient = new Dropbox({
      fetch: fetch,
      accessToken: process.env.DROPBOX_ACCESS_TOKEN
    });
    const dropboxService = new DropboxService(dropboxClient);

    const tmpobj = tmp.dirSync({ template: 'dropbox-XXXXXX', unsafeCleanup: true });

    return new DropboxProvider(dropboxService, process.env.SOURCE_PATH, tmpobj.name);
  }
};
