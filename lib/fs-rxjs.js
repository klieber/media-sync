const { Observable } = require('rxjs');
const fs = require('fs');

function read(filename) {
  return new Observable(subscriber => {

    const stream = fs.createReadStream(filename);

    stream.on('data', function(buffer) {
      subscriber.next(buffer);
    });

    stream.on('end', function() {
      subscriber.complete();
    });

    stream.on('error', function(error) {
      subscriber.error(error);
    });

  });
}

module.exports = {
  read
};