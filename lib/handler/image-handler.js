class ImageHandler {
  supports(filename) {
    return filename.match(/\.(?:jpg|jpeg|png)/, '');
  }

  handle(filename) {
    console.log(`ImageHandler processing ${filename}`);
  }
}

module.exports = ImageHandler;
