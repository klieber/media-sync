const { extractDate } = require('./date-extractor');
const format = require('date-fns/format');

async function createFileCoordinates(target, currentFilename) {
  const fileDate = await extractDate(currentFilename);
  const dirname = `${target.replace(/\/$/, '')}/${format(fileDate, 'yyyy/MM')}`;
  const extension = currentFilename.replace(/^.*\.([^./]*)$/, '$1');
  const basename = `${format(fileDate, 'yyyyMMdd_HHmmss')}.${extension}`;
  return {
    dirname,
    basename,
    extension,
    name: `${dirname}/${basename}`
  };
}

module.exports = {
  createFileCoordinates
};
