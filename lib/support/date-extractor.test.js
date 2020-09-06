const mockExifProcess = {
  open: jest.fn(),
  close: jest.fn(),
  readMetadata: jest.fn()
};

jest.mock('node-exiftool', () => {
  return {
    ExiftoolProcess: jest.fn().mockImplementation(() => mockExifProcess)
  };
});

const fs = require('fs');
const mediaType = require('./media-type');
const { extractDate } = require('./date-extractor');
const { when } = require('jest-when');

const FILENAME = 'myfile.jpg';

const EXIF_DATES = {
  DateTimeOriginal: '2020:04:08 13:00:00.000Z',
  DateTimeDigitized: '2020:04:08 14:00:00.000Z',
  CreateDate: '2020:04:08 15:00:00.000Z',
  ModifyDate: '2020:04:08 16:00:00.000Z',
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
    jest.spyOn(mediaType, 'isJpg');
    jest.spyOn(mediaType, 'isMp4');
    mockExifProcess.open.mockResolvedValue();
    mockExifProcess.close.mockResolvedValue();
  });

  describe('from exif', () => {
    beforeAll(() => {
      when(mediaType.isJpg).calledWith(FILENAME).mockResolvedValue(true);
    });

    test('DateTimeOriginal', async () => {
      mockExifProcess.readMetadata.mockResolvedValue({ data: [EXIF_DATES] });
      expect(await extractDate(FILENAME)).toStrictEqual(new Date('2020-04-08T13:00:00.000Z'));
    });

    test('DateTimeDigitized', async () => {
      mockExifProcess.readMetadata.mockResolvedValue({
        data: [omit(EXIF_DATES, 'DateTimeOriginal')]
      });
      expect(await extractDate(FILENAME)).toStrictEqual(new Date('2020-04-08T14:00:00.000Z'));
    });

    test('CreateDate', async () => {
      mockExifProcess.readMetadata.mockResolvedValue({
        data: [omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized')]
      });
      expect(await extractDate(FILENAME)).toStrictEqual(new Date('2020-04-08T15:00:00.000Z'));
    });

    test('ModifyDate', async () => {
      mockExifProcess.readMetadata.mockResolvedValue({
        data: [omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate')]
      });
      expect(await extractDate(FILENAME)).toStrictEqual(new Date('2020-04-08T16:00:00.000Z'));
    });

    test('GPSTimeStamp', async () => {
      mockExifProcess.readMetadata.mockResolvedValue({
        data: [omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate', 'ModifyDate')]
      });
      expect(await extractDate(FILENAME)).toEqual(new Date('2020-04-08T17:00:00.000Z'));
    });

    test('GPSDateStamp', async () => {
      mockExifProcess.readMetadata.mockResolvedValue({
        data: [omit(EXIF_DATES, 'DateTimeOriginal', 'DateTimeDigitized', 'CreateDate', 'ModifyDate', 'GPSTimeStamp')]
      });
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
      mockExifProcess.readMetadata.mockResolvedValue({});
      fs.promises.stat.mockResolvedValue(STAT_INFO);
      expect(await extractDate(FILENAME)).toBe(STAT_INFO.birthtime);
    });
  });
});
