const DropboxService = require('./dropbox-service');
const DropboxProvider = require('./dropbox-provider');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');

module.exports = {
  create: () => {
    const dropboxClient = new Dropbox({
      fetch: fetch,
      accessToken: process.env.DROPBOX_ACCESS_TOKEN
    });
    const dropboxService = new DropboxService(dropboxClient);
    return new DropboxProvider(dropboxService, process.env.SOURCE_PATH, process.env.TARGET_PATH);
  }
};
