const DropboxTokenStore = require('./dropbox-token-store');
const { Dropbox } = require('dropbox');
const fetch = require('node-fetch');
const logger = require('../../support/logger').create('lib/provider/dropbox/dropbox-client-factory');

module.exports = {
  create: async (config) => {
    const tokenStore = new DropboxTokenStore(config.token_store);
    let token = tokenStore.read();
    let authorizationCode = config.auth_code;

    if (!token && !authorizationCode) {
      logger.debug('no access token or authorization code available');
      const authenticationUrl = new Dropbox({
        fetch: fetch,
        clientId: config.client_id
      }).getAuthenticationUrl(null, null, 'code', 'offline', null, 'none', false);
      logger.warn('You must authorize media-sync to access your dropbox account using this URL: ' + authenticationUrl);
      throw new Error('Unauthorized to access dropbox.');
    } else {
      if (!token) {
        logger.debug('retrieving access token using authorization code');
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
        clientSecret: config.client_secret,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt
      });

      logger.debug('refreshing access token');
      await dropboxClient.checkAndRefreshAccessToken();

      logger.debug('storing access token');
      tokenStore.store({
        accessToken: dropboxClient.getAccessToken(),
        refreshToken: dropboxClient.getRefreshToken(),
        accessTokenExpiresAt: dropboxClient.getAccessTokenExpiresAt()
      });

      return dropboxClient;
    }
  }
};
