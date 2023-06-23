const { extractDate } = require('./date-extractor');
const format = require('date-fns/format');
const fs = require('fs');
const DropboxContentHasher = require('../provider/dropbox/dropbox-content-hasher');
const logger = require('./logger').create('lib/support/file-utils');
const config = require('../config');
const sharp = require('sharp');

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

function changeExtension(fileInfo, convertToExtension) {
  const timestamp = fileInfo.timestamp;
  const contentHash = fileInfo.contentHash;
  const dirname = fileInfo.dirname;
  const extension = convertToExtension.toLowerCase();
  const basename = `${format(timestamp, 'yyyy-MM-dd_HH.mm.ss')}_${contentHash.substring(0, 6)}.${extension}`;
  return {
    dirname,
    basename,
    extension,
    contentHash,
    name: `${dirname}/${basename}`,
    sourceFile: fileInfo.sourceFile,
    timestamp: timestamp,
    conversion: true
  };
}

function splitPaths(path) {
  return path.split(/\//).map((ignored, index, array) => array.slice(0, index + 1).join('/'));
}

async function mkdirp(targetPath) {
  const mkdirOptions = { recursive: true };
  if (config.dir_mode) {
    mkdirOptions.mode = config.dir_mode;
  }
  const firstPathCreated = await fs.promises.mkdir(targetPath, mkdirOptions);

  if (config.user_id && config.group_id && firstPathCreated) {
    await Promise.all(
      splitPaths(targetPath)
        .filter((path) => path.startsWith(firstPathCreated))
        .map((path) => fs.promises.chown(path, config.user_id, config.group_id))
    );
  }
}

async function moveFile(sourceFile, targetDirectory, conversions) {
  let target = await createFileInfo(sourceFile, targetDirectory);

  if (conversions && conversions[target.extension]) {
    target = changeExtension(target, conversions[target.extension]);
  }

  if (fs.existsSync(target.name)) {
    throw new Error(`file already exists: ${target.name}`);
  }

  logger.info(
    `${config.dry_run ? 'DRY RUN: ' : ''}${target.conversion ? 'converting' : 'moving'} ${sourceFile} \u279C ${
      target.name
    }`
  );
  if (!config.dry_run) {
    await mkdirp(target.dirname);
    if (target.conversion) {
      let buffer = await fs.promises.readFile(sourceFile);
      await sharp(buffer).toFormat(target.extension).toFile(target.name);
    } else {
      await fs.promises.copyFile(sourceFile, target.name);
    }
    await fs.promises.utimes(target.name, target.timestamp, target.timestamp);

    if (config.file_mode) {
      await fs.promises.chmod(target.name, config.file_mode);
    }

    if (config.user_id && config.group_id) {
      await fs.promises.chown(target.name, config.user_id, config.group_id);
    }
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
