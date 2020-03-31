const dch = require('./dropbox-hasher');
const { read } = require('./fs-rxjs');
const { reduce, map } = require('rxjs/operators');

function hash(filename) {

  return read(filename)
    .pipe(
      reduce((hasher, buffer) => hasher.update(buffer), dch.create()),
      map(hasher => hasher.digest('hex'))
    );

}

module.exports = {
  hash
};