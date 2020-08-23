const DropboxTokenStore = require('./dropbox-token-store');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');
const logger = require('../../support/logger').create('lib/provider/dropbox/dropbox-client-factory');

module.exports = {
  create: async (config) => {
    const tokenStore = new DropboxTokenStore(config.token_store);
    let token = tokenStore.read();
    let authorizationCode = process.env.DROPBOX_AUTH_CODE;

    if (!token && !authorizationCode) {
      const authenticationUrl = new Dropbox({
        fetch: fetch,
        clientId: config.client_id,
        clientSecret: config.client_secret
      }).getAuthenticationUrl(null, null, 'code', 'offline', null, 'none', false);
      logger.warn('You must authorize media-sync to access your dropbox account using this URL: ' + authenticationUrl);
      throw new Error('Unauthorized to access dropbox.');
    } else {
      if (!token) {
        const tempClient = new Dropbox({
          fetch: fetch,
          clientId: config.client_id,
          clientSecret: config.client_secret
        });

        token = await tempClient.getAccessTokenFromCode(null, authorizationCode);
      }

      const dropboxClient = new Dropbox({
        fetch: fetch,
        clientId: config.client_id,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt
      });

      await dropboxClient.checkAndRefreshAccessToken();

      tokenStore.store({
        accessToken: dropboxClient.getAccessToken(),
        refreshToken: dropboxClient.getRefreshToken(),
        accessTokenExpiresAt: dropboxClient.getAccessTokenExpiresAt()
      });

      return dropboxClient;
    }
  }
};
