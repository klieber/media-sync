const ImageHandler = require('./image-handler');
const imageHandler = new ImageHandler();

test('ImageHandler supports extension: jpeg', () => {
  expect(imageHandler.supports('/media/image.jpeg')).toBeTruthy();
});

test('ImageHandler supports extension: jpg', () => {
  expect(imageHandler.supports('/media/image.jpg')).toBeTruthy();
});

test('ImageHandler supports extension: png', () => {
  expect(imageHandler.supports('/media/image.png')).toBeTruthy();
});

test('ImageHandler handles image', () => {
  // TODO: Implement
  // imageHandler.handle('/media/image.png');
  expect(true).toBeTruthy();
});
