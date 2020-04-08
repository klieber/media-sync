const { extractDate } = require('./date-extractor');
const format = require('date-fns/format');
const fs = require('fs');
const logger = require('./logger').create('lib/support/file-utils');

async function createFileInfo(sourceFile, targetDirectory) {
  const fileDate = await extractDate(sourceFile);
  const dirname = `${targetDirectory.replace(/\/$/, '')}/${format(fileDate, 'yyyy/MM')}`;
  const extension = sourceFile.replace(/^.*\.([^./]*)$/, '$1').toLowerCase();
  const basename = `${format(fileDate, 'yyyyMMdd_HHmmss')}.${extension}`;
  return {
    dirname,
    basename,
    extension,
    name: `${dirname}/${basename}`,
    sourceFile: sourceFile,
    timestamp: fileDate
  };
}

async function moveFile(sourceFile, targetDirectory) {
  const target = await createFileInfo(sourceFile, targetDirectory);

  if (fs.existsSync(target.name)) {
    throw new Error(`file already exists: ${target.name}`);
  }

  logger.info(`moving ${sourceFile} \u279C ${target.name}`);
  await fs.promises.mkdir(target.dirname, { recursive: true });
  await fs.promises.copyFile(sourceFile, target.name);
  await fs.promises.utimes(target.name, target.timestamp, target.timestamp);
}

module.exports = {
  createFileInfo: createFileInfo,
  moveFile: moveFile
};
