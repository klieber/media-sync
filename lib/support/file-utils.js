const { extractDate } = require('./date-extractor');
const format = require('date-fns/format');
const fs = require('fs');
const DropboxContentHasher = require('../provider/dropbox/dropbox-content-hasher');
const logger = require('./logger').create('lib/support/file-utils');

const USER_ID = process.env.MEDIA_SYNC_UID ? parseInt(process.env.MEDIA_SYNC_UID) : null;
const GROUP_ID = process.env.MEDIA_SYNC_GID ? parseInt(process.env.MEDIA_SYNC_GID) : null;

async function createFileInfo(sourceFile, targetDirectory) {
  const timestamp = await extractDate(sourceFile);
  const contentHash = await hash(sourceFile);
  const dirname = `${targetDirectory.replace(/\/$/, '')}/${format(timestamp, 'yyyy/MM')}`;
  const extension = sourceFile.replace(/^.*\.([^./]*)$/, '$1').toLowerCase();
  const basename = `${format(timestamp, 'yyyy-MM-dd_HH.mm.ss')}_${contentHash.substring(0, 6)}.${extension}`;
  return {
    dirname,
    basename,
    extension,
    contentHash,
    name: `${dirname}/${basename}`,
    sourceFile: sourceFile,
    timestamp: timestamp
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

  if (USER_ID && GROUP_ID) {
    await fs.promises.chown(target.name, USER_ID, GROUP_ID);
  }
}

async function hash(filename) {
  const hasher = new DropboxContentHasher();
  const stream = fs.createReadStream(filename);
  for await (const buffer of stream) {
    hasher.update(buffer);
  }
  return hasher.digest('hex');
}

module.exports = {
  createFileInfo: createFileInfo,
  moveFile: moveFile
};
