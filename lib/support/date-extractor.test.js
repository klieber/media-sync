const exifr = require('exifr');
const fs = require('fs');
const mediaType = require('./media-type');
const { extractDate } = require('./date-extractor');
const { when } = require('jest-when');

const FILENAME = 'myfile.jpg';

const EXIF_DATES = {
  DateTimeOriginal: new Date('2020-04-08T13:00:00.000Z'),
  DateTimeDigitized: new Date('2020-04-08T14:00:00.000Z'),
  CreateDate: new Date('2020-04-08T15:00:00.000Z'),
  ModifyDate: new Date('2020-04-08T16:00:00.000Z'),
  GPSDateStamp: '2020:04:08',
  GPSTimeStamp: '17:00:00'
};

const STAT_INFO = {
  birthtime: new Date('2020-04-08T18:00:00.000Z'),
  mtime: new Date('2020-04-08T19:00:00.000Z')
};

const omit = (o, ...keys) =>
  keys.reduce((memo, key) => {
    // eslint-disable-next-line no-unused-vars
    const { [key]: ignored, ...rest } = memo;
    return rest;
  }, o);

describe('extractDate', () => {
  beforeAll(() => {
    jest.spyOn(fs.promises, 'stat');
    jest.spyOn(exifr, 'parse');
    jest.spyOn(mediaType, 'isJpg');
    jest.spyOn(mediaType, 'isMp4');
  });

  describe('from exif', () => {
    beforeAll(() => {
      when(mediaType.isJpg).calledWith(FILENAME).mockResolvedValue(true);
    });

    test('DateTimeOriginal', async () => {
      exifr.parse.mockResolvedValue(EXIF_DATES);
      expect(await extractDate(FILENAME)).toBe(EXIF_DATES.DateTimeOriginal);
    });

    test('DateTimeDigitized', async () => {
      exifr.parse.mockResolvedValue(omit(EXIF_DATES, 'DateTimeOriginal'));
      expect(await extractDate(FILENAME)).toBe(EXIF_DATES.DateTimeDigitized);
    });

    test('CreateDate', async () => {
      exifr.parse.mockResolvedValue(omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized'));
      expect(await extractDate(FILENAME)).toEqual(EXIF_DATES.CreateDate);
    });

    test('ModifyDate', async () => {
      exifr.parse.mockResolvedValue(omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate'));
      expect(await extractDate(FILENAME)).toEqual(EXIF_DATES.ModifyDate);
    });

    test('GPSTimeStamp', async () => {
      exifr.parse.mockResolvedValue(
        omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate', 'ModifyDate')
      );
      expect(await extractDate(FILENAME)).toEqual(new Date('2020-04-08T17:00:00.000Z'));
    });

    test('GPSDateStamp', async () => {
      exifr.parse.mockResolvedValue(
        omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate', 'ModifyDate', 'GPSTimeStamp')
      );
      expect(await extractDate(FILENAME)).toEqual(new Date('2020-04-08T12:00:00.000Z'));
    });
  });

  describe('from file', () => {
    test('birthtime', async () => {
      when(mediaType.isJpg).calledWith(FILENAME).mockResolvedValue(false);
      when(mediaType.isMp4).calledWith(FILENAME).mockResolvedValue(false);
      fs.promises.stat.mockResolvedValue(STAT_INFO);
      expect(await extractDate(FILENAME)).toBe(STAT_INFO.birthtime);
    });

    test('mtime', async () => {
      when(mediaType.isJpg).calledWith(FILENAME).mockResolvedValue(false);
      when(mediaType.isMp4).calledWith(FILENAME).mockResolvedValue(false);
      fs.promises.stat.mockResolvedValue(omit(STAT_INFO, 'birthtime'));
      expect(await extractDate(FILENAME)).toBe(STAT_INFO.mtime);
    });

    test('jpg fallback', async () => {
      when(mediaType.isJpg).calledWith(FILENAME).mockResolvedValue(true);
      when(mediaType.isMp4).calledWith(FILENAME).mockResolvedValue(false);
      exifr.parse.mockResolvedValue({});
      fs.promises.stat.mockResolvedValue(STAT_INFO);
      expect(await extractDate(FILENAME)).toBe(STAT_INFO.birthtime);
    });
  });
});
