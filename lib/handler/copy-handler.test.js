const fileUtils = require('../support/file-utils.js');
const CopyHandler = require('./copy-handler');
const { when } = require('jest-when');

const TARGET = './target';
const copyHandler = new CopyHandler(['jpg', 'jpeg', 'png'], TARGET);

jest.mock('../support/file-utils.js');

describe('CopyHandler', () => {
  describe('supports', () => {
    test('jpeg', () => {
      expect(copyHandler.supports('/media/image.jpeg')).toBeTruthy();
    });

    test('jpg', () => {
      expect(copyHandler.supports('/media/image.jpg')).toBeTruthy();
    });

    test('png', () => {
      expect(copyHandler.supports('/media/image.png')).toBeTruthy();
    });

    test('not mp4', () => {
      expect(copyHandler.supports('/media/video.mp4')).toBeFalsy();
    });
  });

  describe('handle', () => {
    const mediaFile = {
      name: 'source.jpg'
    };

    beforeAll(() => {
      mediaFile.delete = jest.fn();
    });

    test('copies file to target and deletes the source file', async () => {
      when(fileUtils.moveFile).calledWith(mediaFile.name, TARGET).mockResolvedValue();
      when(mediaFile.delete).calledWith().mockResolvedValue();
      await copyHandler.handle(mediaFile);
      expect(mediaFile.delete).toHaveBeenCalled();
    });

    test('does not delete the source file when copy fails', async () => {
      when(fileUtils.moveFile).calledWith(mediaFile.name, TARGET).mockRejectedValue(new Error('mock error'));
      await copyHandler.handle(mediaFile);
      expect(mediaFile.delete).not.toHaveBeenCalled();
    });
  });
});
