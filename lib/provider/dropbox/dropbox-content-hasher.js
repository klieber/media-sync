'use strict';

/**
 * Computes a hash using the same algorithm that the Dropbox API uses for the
 * the "content_hash" metadata field.
 *
 * The `digest()` method returns a raw binary representation of the hash.
 * The "content_hash" field in the Dropbox API is a hexadecimal-encoded version
 * of the digest.
 *
 * Example:
 *
 *     const fs = require('fs');
 *     const dch = require('dropbox-content-hasher');
 *
 *     const hasher = dch.create();
 *     const f = fs.createReadStream('some-file');
 *     f.on('data', function(buf) {
 *       hasher.update(buf);
 *     });
 *     f.on('end', function(err) {
 *       const hexDigest = hasher.digest('hex');
 *       console.log(hexDigest);
 *     });
 *     f.on('error', function(err) {
 *       console.error("Error reading from file: " + err);
 *       process.exit(1);
 *     });
 */

const crypto = require('crypto');
const assert = require('assert').strict;

class DropboxContentHasher {
  static BLOCK_SIZE = 4 * 1024 * 1024;

  #algorithm;
  #overallHasher;
  #blockHasher;
  #blockPos;

  constructor(algorithm = 'sha256', blockPos = 0) {
    this.#algorithm = algorithm;
    this.#overallHasher = crypto.createHash(algorithm);
    this.#blockHasher = crypto.createHash(algorithm);
    this.#blockPos = blockPos;
  }

  update(data, inputEncoding) {
    assert.ok(this.#overallHasher, 'Cannot call "update()" after "digest()" has already been called.');

    if (!Buffer.isBuffer(data)) {
      if (
        inputEncoding !== undefined &&
        inputEncoding !== 'utf8' &&
        inputEncoding !== 'ascii' &&
        inputEncoding !== 'latin1'
      ) {
        // The docs for the standard hashers say they only accept these three encodings.
        throw new Error('Invalid "inputEncoding": ' + JSON.stringify(inputEncoding));
      }
      data = Buffer.from(data, inputEncoding);
    }

    let offset = 0;
    while (offset < data.length) {
      if (this.#blockPos === DropboxContentHasher.BLOCK_SIZE) {
        this.#overallHasher.update(this.#blockHasher.digest());
        this.#blockHasher = crypto.createHash(this.#algorithm);
        this.#blockPos = 0;
      }

      const spaceInBlock = DropboxContentHasher.BLOCK_SIZE - this.#blockPos;
      const inputPartEnd = Math.min(data.length, offset + spaceInBlock);
      const inputPartLength = inputPartEnd - offset;
      this.#blockHasher.update(data.slice(offset, inputPartEnd));

      this.#blockPos += inputPartLength;
      offset = inputPartEnd;
    }

    return this;
  }

  digest(encoding) {
    assert.ok(this.#overallHasher, 'Cannot call "digest()" after it has already been called.');

    if (this.#blockPos > 0) {
      this.#overallHasher.update(this.#blockHasher.digest());
      this.#blockHasher = null;
    }

    let result = this.#overallHasher.digest(encoding);
    this.#overallHasher = null; // Make sure we can't use this object anymore.
    return result;
  }
}

module.exports = DropboxContentHasher;
