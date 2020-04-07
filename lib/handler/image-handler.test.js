const ImageHandler = require('./image-handler');
const imageHandler = new ImageHandler();

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
    test.todo('handles image');
  });
});
