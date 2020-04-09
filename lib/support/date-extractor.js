const exifr = require('exifr');
const fs = require('fs');
const imageType = require('./image-type');

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
  if (await imageType.isJpg(filename)) {
    dateObject = await extractDateFromExif(filename);
  }
  if (dateObject == null) {
    dateObject = await extractDateFromFile(filename);
  }
  return dateObject;
}

module.exports = {
  extractDate
};
