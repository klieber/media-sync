const fs = require('fs');
const mediaType = require('./media-type');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const exiftool = require('node-exiftool');
const exiftoolBin = require('dist-exiftool');
const exif = new exiftool.ExiftoolProcess(exiftoolBin);

const DATE_TAGS = [
  'DateTimeOriginal',
  'DateTimeDigitized',
  'OffsetTime',
  'OffsetTimeOriginal',
  'OffsetTimeDigitized',
  'CreateDate',
  'ModifyDate',
  'GPSDateTime',
  'GPSDateStamp',
  'GPSTimeStamp'
];

async function extractDateFromMp4(filename) {
  const info = await ffprobe(filename, { path: ffprobeStatic.path });
  return info.streams
    .filter((stream) => stream.tags && stream.tags.creation_time)
    .map((stream) => new Date(stream.tags.creation_time))
    .find((date) => date instanceof Date && !isNaN(date.getTime()));
}

function extractDateFromMetadataTags(metadata) {
  let dateObject =
    metadata.DateTimeOriginal || metadata.DateTimeDigitized || metadata.CreateDate || metadata.ModifyDate;

  if (dateObject && (typeof dateObject === 'string' || dateObject instanceof String)) {
    dateObject = new Date(dateObject.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
  } else if (!dateObject && metadata.GPSDateStamp) {
    let gpsDate = metadata.GPSDateStamp.replace(/:/g, '-');
    let gpsTime = metadata.GPSTimeStamp || '12:00:00';
    dateObject = new Date(`${gpsDate}T${gpsTime}.000Z`);
  }
  return dateObject;
}

async function readExif(filename, tags) {
  await exif.open();
  const { data, error } = await exif.readMetadata(filename, tags);
  await exif.close();
  if (error) {
    throw new Error('unable to read exif: ', error);
  }

  return data ? data.reduce((combined, item) => Object.assign(combined, item), {}) : {};
}

async function extractDateFromExif(filename) {
  const metadata = await readExif(filename, DATE_TAGS);
  const dateObject = extractDateFromMetadataTags(metadata);
  return dateObject;
}

async function extractDateFromFile(filename) {
  const stats = await fs.promises.stat(filename);
  return stats.mtime;
}

async function extractDate(filename) {
  let dateObject = null;
  if ((await mediaType.isJpg(filename)) || (await mediaType.isPng(filename))) {
    dateObject = await extractDateFromExif(filename);
  }
  if (dateObject == null && (await mediaType.isMp4(filename))) {
    dateObject = await extractDateFromMp4(filename);
  }
  if (dateObject == null) {
    dateObject = await extractDateFromFile(filename);
  }
  return dateObject;
}

module.exports = {
  extractDate
};
