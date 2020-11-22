const DropboxTokenStore = require('./dropbox-token-store');
const { Dropbox, DropboxAuth } = require('dropbox');
const fetch = require('node-fetch');
const logger = require('../../support/logger').create('lib/provider/dropbox/dropbox-client-factory');

module.exports = {
  create: async (config) => {
    const tokenStore = new DropboxTokenStore(config.token_store);
    let token = tokenStore.read();
    let authorizationCode = config.auth_code;

    if (!token && !authorizationCode) {
      logger.debug('no access token or authorization code available');
      const authenticationUrl = new DropboxAuth({
        fetch: fetch,
        clientId: config.client_id
      }).getAuthenticationUrl(null, null, 'code', 'offline', null, 'none', false);
      logger.warn('You must authorize media-sync to access your dropbox account using this URL: ' + authenticationUrl);
      throw new Error('Unauthorized to access dropbox.');
    } else {
      if (!token) {
        logger.debug('retrieving access token using authorization code');
        const tempAuth = new DropboxAuth({
          fetch: fetch,
          clientId: config.client_id,
          clientSecret: config.client_secret
        });

        const response = await tempAuth.getAccessTokenFromCode(null, authorizationCode);
        if (response.status < 200 || response.status >= 300) {
          throw new Error('Unable to get access token from code');
        }
        token = response.result;
      }

      const dropboxAuth = new DropboxAuth({
        fetch: fetch,
        clientId: config.client_id,
        clientSecret: config.client_secret,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        accessTokenExpiresAt: new Date(Date.now() + token.expires_in)
      });

      logger.debug('refreshing access token');
      await dropboxAuth.checkAndRefreshAccessToken();

      logger.debug('storing access token');
      tokenStore.store({
        accessToken: dropboxAuth.getAccessToken(),
        refreshToken: dropboxAuth.getRefreshToken(),
        accessTokenExpiresAt: dropboxAuth.getAccessTokenExpiresAt()
      });

      const dropboxClient = new Dropbox({
        fetch: fetch,
        auth: dropboxAuth
      });

      return dropboxClient;
    }
  }
};
