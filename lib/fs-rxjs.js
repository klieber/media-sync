const { Observable } = require('rxjs');
const fs = require('fs');

function read(filename) {
  return new Observable((subscriber) => {
    const stream = fs.createReadStream(filename);
    stream.on('data', (buffer) => subscriber.next(buffer));
    stream.on('end', () => subscriber.complete());
    stream.on('error', (error) => subscriber.error(error));
  });
}

module.exports = {
  read
};
