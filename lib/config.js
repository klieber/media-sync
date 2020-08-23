const config = require('rc')('mediasync', {
  schedule: '0 */15 * * * *'
});

module.exports = config;
