const config = require('rc')('mediasync', {
  schedule: '0 */15 * * * *',
  dry_run: false
});

if (config.umask) {
  config.umask = parseInt(config.umask, 8);
  process.umask(config.umask);
}

if (config.file_mode && typeof config.file_mode === 'string') {
  config.file_mode = parseInt(config.file_mode, 8);
}

if (config.dir_mode && typeof config.dir_mode === 'string') {
  config.dir_mode = parseInt(config.dir_mode, 8);
}

module.exports = config;
