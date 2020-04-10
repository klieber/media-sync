const fileUtils = require('../support/file-utils.js');
const ImageHandler = require('./image-handler');
const { when } = require('jest-when');

const TARGET = './target';
const imageHandler = new ImageHandler(TARGET);

jest.mock('../support/file-utils.js');

describe('ImageHandler', () => {
  describe('supports', () => {
    test('jpeg', () => {
      expect(imageHandler.supports('/media/image.jpeg')).toBeTruthy();
    });

    test('jpg', () => {
      expect(imageHandler.supports('/media/image.jpg')).toBeTruthy();
    });

    test('png', () => {
      expect(imageHandler.supports('/media/image.png')).toBeTruthy();
    });

    test('not mp4', () => {
      expect(imageHandler.supports('/media/video.mp4')).toBeFalsy();
    });
  });

  describe('handle', () => {
    const mediaFile = {
      sourceFile: 'source.jpg'
    };

    beforeAll(() => {
      mediaFile.delete = jest.fn();
    });

    test('copies file to target and deletes the source file', async () => {
      when(fileUtils.moveFile).calledWith(mediaFile.sourceFile, TARGET).mockResolvedValue();
      when(mediaFile.delete).calledWith().mockResolvedValue();
      await imageHandler.handle(mediaFile);
      expect(mediaFile.delete).toHaveBeenCalled();
    });

    test('does not delete the source file when copy fails', async () => {
      when(fileUtils.moveFile).calledWith(mediaFile.sourceFile, TARGET).mockRejectedValue(new Error('mock error'));
      await imageHandler.handle(mediaFile);
      expect(mediaFile.delete).not.toHaveBeenCalled();
    });
  });
});
