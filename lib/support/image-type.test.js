const fs = require('fs');

const { isPng, isJpg } = require('./image-type');
const { when } = require('jest-when');

describe('ImageType', () => {
  const mockFile = (filename, fileDescriptor, mockBuffer) => {
    const fileHandle = {
      fd: fileDescriptor,
      close: jest.fn()
    };

    when(fs.promises.open).calledWith(filename, 'r').mockResolvedValue(fileHandle);
    when(fs.read)
      .calledWith(fileDescriptor, expect.any(Buffer), 0, expect.anything(), 0, expect.any(Function))
      .mockImplementation((fd, buffer, offset, length, position, callback) => {
        callback(length, mockBuffer);
      });
  };

  beforeEach(() => {
    jest.spyOn(fs.promises, 'open');
    jest.spyOn(fs, 'read');
    mockFile('mockimage.jpg', 1, Buffer.from([255, 216, 255]));
    mockFile('mockimage.png', 2, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  });

  describe('isJpg', () => {
    test('file is a jpg', async (done) => {
      expect(await isJpg('mockimage.jpg')).toBeTruthy();
      done();
    });

    test('file is not a jpg', async (done) => {
      expect(await isJpg('mockimage.png')).toBeFalsy();
      done();
    });
  });

  describe('isPng', () => {
    test('file is a png', async (done) => {
      expect(await isPng('mockimage.png')).toBeTruthy();
      done();
    });

    test('file is not a png', async (done) => {
      expect(await isPng('mockimage.jpg')).toBeFalsy();
      done();
    });
  });
});
