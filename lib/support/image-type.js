const fs = require('fs');

async function isPng(filename) {
  const buffer = await readPart(filename, 0, 8);
  return (
    buffer &&
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

async function isJpg(filename) {
  const buffer = await readPart(filename, 0, 3);
  return buffer && buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
}

async function readPart(filename, start, length) {
  const fh = await fs.promises.open(filename, 'r');
  return await new Promise((resolve) => {
    fs.read(fh.fd, Buffer.alloc(length), 0, length, start, (bytesRead, buffer) => {
      const resultBuffer = bytesRead < length ? buffer.slice(0, bytesRead) : buffer;
      fh.close();
      resolve(resultBuffer);
    });
  });
}

module.exports = {
  isPng,
  isJpg
};
