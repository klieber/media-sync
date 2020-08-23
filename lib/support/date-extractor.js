const exifr = require('exifr');
const fs = require('fs');
const mediaType = require('./media-type');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');

async function extractDateFromMp4(filename) {
  const info = await ffprobe(filename, { path: ffprobeStatic.path });
  return info.streams
    .filter((stream) => stream.tags && stream.tags.creation_time)
    .map((stream) => new Date(stream.tags.creation_time))
    .find((date) => date instanceof Date && !isNaN(date.getTime()));
}

async function extractDateFromExif(filename) {
  const metadata = await exifr.parse(filename, {
    pick: ['DateTimeOriginal', 'DateTimeDigitized', 'CreateDate', 'ModifyDate', 'GPSDateStamp', 'GPSTimeStamp']
  });

  let dateObject =
    metadata.DateTimeOriginal || metadata.DateTimeDigitized || metadata.CreateDate || metadata.ModifyDate;

  if (!dateObject && metadata.GPSDateStamp) {
    let gpsDate = metadata.GPSDateStamp.replace(/:/g, '-');
    let gpsTime = metadata.GPSTimeStamp || '12:00:00';
    dateObject = new Date(`${gpsDate}T${gpsTime}.000Z`);
  }

  return dateObject;
}

async function extractDateFromFile(filename) {
  const stats = await fs.promises.stat(filename);
  return stats.birthtime || stats.mtime;
}

async function extractDate(filename) {
  let dateObject = null;
  if (await mediaType.isJpg(filename)) {
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
