import fs from 'fs';

const TYPES = {
  jpg: {
    offset: 0,
    length: 3,
    signatures: [Buffer.from([0xff, 0xd8, 0xff])]
  },
  mp4: {
    offset: 4,
    length: 8,
    signatures: [
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20]),
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x4d, 0x53, 0x4e, 0x56]),
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]),
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32])
    ]
  },
  png: {
    offset: 0,
    length: 8,
    signatures: [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])]
  }
};

async function isJpg(filename) {
  return isType(TYPES.jpg, filename);
}

async function isMp4(filename) {
  return isType(TYPES.mp4, filename);
}

async function isPng(filename) {
  return isType(TYPES.png, filename);
}

async function isType(type, filename) {
  const buffer = await readPart(filename, type.offset, type.length);
  return buffer && buffer.length >= type.length && type.signatures.some((signature) => buffer.compare(signature) === 0);
}

async function readPart(filename, start, length) {
  const fh = await fs.promises.open(filename, 'r');
  return await new Promise((resolve, reject) => {
    fs.read(fh.fd, Buffer.alloc(length), 0, length, start, (error, bytesRead, buffer) => {
      if (error) {
        reject(error);
      } else {
        const resultBuffer = bytesRead < length ? buffer.slice(0, bytesRead) : buffer;
        fh.close();
        resolve(resultBuffer);
      }
    });
  });
}

module.exports = {
  isPng,
  isJpg,
  isMp4
};
