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

import { createHash, Hash, HexBase64Latin1Encoding } from 'crypto';
import { strict as assert } from 'assert';

class DropboxContentHasher {
  static BLOCK_SIZE: number = 4 * 1024 * 1024;

  #algorithm: string;
  #overallHasher: Hash | null;
  #blockHasher: Hash | null;
  #blockPos: number;

  constructor(algorithm = 'sha256', blockPos = 0) {
    this.#algorithm = algorithm;
    this.#overallHasher = createHash(algorithm);
    this.#blockHasher = createHash(algorithm);
    this.#blockPos = blockPos;
  }

  update(data: string | Buffer, inputEncoding?: BufferEncoding): DropboxContentHasher {
    if (!this.#overallHasher || !this.#blockHasher) {
      assert.fail('Cannot call "update()" after "digest()" has already been called.');
    }

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
        this.#blockHasher = createHash(this.#algorithm);
        this.#blockPos = 0;
      }

      const spaceInBlock: number = DropboxContentHasher.BLOCK_SIZE - this.#blockPos;
      const inputPartEnd: number = Math.min(data.length, offset + spaceInBlock);
      const inputPartLength: number = inputPartEnd - offset;
      this.#blockHasher.update(data.slice(offset, inputPartEnd));

      this.#blockPos += inputPartLength;
      offset = inputPartEnd;
    }

    return this;
  }

  digest(encoding: HexBase64Latin1Encoding): string {
    if (!this.#overallHasher || !this.#blockHasher) {
      assert.fail('Cannot call "digest()" after it has already been called.');
    }

    if (this.#blockPos > 0) {
      this.#overallHasher.update(this.#blockHasher.digest());
      this.#blockHasher = null;
    }

    const result: string = this.#overallHasher.digest(encoding);
    this.#overallHasher = null; // Make sure we can't use this object anymore.
    return result;
  }
}

export default DropboxContentHasher;
